#!/usr/bin/env bash
# Reads playwright-report/report.json and prints only the failing tests:
# location, title, project, and a trimmed error message (ANSI stripped,
# capped at 8 lines). Exits non-zero if any test failed.
#
# Usage:
#   scripts/compact-playwright-errors.sh [report.json] [--full] [--json[=out.json]]
#
# --full           don't cap the error message length
# --json[=FILE]    emit structured JSON instead of text; write to FILE if
#                  given, otherwise print JSON to stdout

set -euo pipefail

full=0
json=0
out=""
report="playwright-report/report.json"

for arg in "$@"; do
	case "$arg" in
	--full) full=1 ;;
	--json) json=1 ;;
	--json=*)
		json=1
		out="${arg#--json=}"
		;;
	-h | --help)
		sed -n '2,12p' "$0"
		exit 0
		;;
	*) report="$arg" ;;
	esac
done

if ! command -v jq >/dev/null 2>&1; then
	echo "compact-playwright-errors: jq is required but not installed." >&2
	exit 2
fi

if [[ ! -f "$report" ]]; then
	echo "compact-playwright-errors: no report at '$report'. Run 'npm test' first." >&2
	exit 2
fi

# The ESC control byte can't be embedded reliably as a literal in this file,
# so it's computed here and passed into jq as an argument.
esc=$(printf '\033')

jq_program='
	def strip_ansi: gsub($esc + "\\[[0-9;]*[a-zA-Z]"; "");

	def compact_message:
		strip_ansi
		| split("\n")
		| map(select(length > 0))
		| if ($full == 0) and (length > 8)
			then .[0:8] + ["... (\(length - 8) more line(s) - rerun with --full or check the HTML report)"]
			else .
			end;

	def all_specs:
		(.specs // [])[] as $spec | ($spec, ((.suites // [])[] | all_specs));

	[.suites[] | all_specs] as $specs
	| ($specs | map(
		.title as $title
		| .file as $sfile
		| .line as $sline
		| .tests[]
		| select(.status == "unexpected" or .status == "flaky") as $test
		| $test.results[]
		| select(.status == "failed" or .status == "timedOut" or .status == "interrupted")
		| {
			title: $title,
			project: $test.projectName,
			outcome: $test.status,
			file: (.error.location.file // $sfile),
			line: (.error.location.line // $sline),
			column: (.error.location.column // 0),
			message: ((.error.message // .errors[0].message // "no error message captured") | compact_message | join("\n"))
		}
	)) as $failures
	| {summary: .stats, failures: $failures}
'

if [[ $json -eq 1 ]]; then
	result=$(jq --argjson full "$full" --arg esc "$esc" "$jq_program" "$report")
	if [[ -n "$out" ]]; then
		printf '%s\n' "$result" >"$out"
		echo "compact-playwright-errors: wrote $(jq '.failures | length' <<<"$result") failure(s) to $out" >&2
	else
		printf '%s\n' "$result"
	fi
else
	jq -r --argjson full "$full" --arg esc "$esc" "$jq_program"'
		| "\(.summary.expected) passed, \(.summary.unexpected) failed, \(.summary.flaky) flaky, \(.summary.skipped) skipped (\(.summary.duration / 1000 | floor)s)"
		, (.failures[] | "\n\(.file):\(.line):\(.column)  [\(.project)] \(.title) (\(.outcome))\n\(.message | split("\n") | map("    " + .) | join("\n"))")
	' "$report"
fi

failed=$(jq '.stats.unexpected' "$report")
[[ "$failed" -eq 0 ]]
