# Campus Life Planner

A lightweight browser-based planner for tracking academic and
extracurricular responsibilities. Campus Life Planner lets you create
and manage tasks or events, review workload statistics, search records
with regular expressions, and back up your data as JSON.

## Overview

The app is built with HTML, CSS, and JavaScript ES modules. Records are
stored in the browser's `localStorage`; if no saved records are
available, the app attempts to load initial data from
`assets/seed.json`.

## Features

-   **Create and edit records** with a title, due date, duration in
    minutes, and tag.
-   **Delete records** after a confirmation prompt.
-   **Dashboard statistics** showing total records, total duration, and
    the most frequently used tag.
-   **Weekly duration target** with a status message when the total is
    under or over the configured cap.
-   **Regex search** across record titles, tags, due dates, and
    durations, with matching text highlighted.
-   **Case-sensitive search** toggle.
-   **Sorting** by due date, title, or duration in ascending or
    descending order.
-   **Duration display** in minutes or hours.
-   **JSON backup and restore** through Export JSON and Import JSON.
-   **Form validation** for titles, dates, durations, and tags, plus a
    warning for consecutive duplicate words in a title.
-   **Responsive table container** and a skip link to the main content.

## Requirements

-   A modern browser with support for JavaScript ES modules,
    `localStorage`, and the File API.
-   A local static web server for reliable loading of ES modules and
    `assets/seed.json`. No package manager or build step is indicated by
    the supplied source files.

## Setup

1.  Place the project files in the expected structure. The supplied HTML
    and JavaScript refer to paths such as `scripts/state.js`,
    `scripts/validators.js`, `styles/main.css`, and `assets/seed.json`.

    ``` text
    project/
    ├── index.html
    ├── tests.html
    ├── scripts/
    │   ├── state.js
    │   ├── search.js
    │   ├── storage.js
    │   ├── ui.js
    │   └── validators.js
    ├── styles/
    │   └── main.css
    └── assets/
        └── seed.json
    ```

    The tree documents paths referenced by the supplied files; ensure
    the stylesheet and seed-data file are present in your project.

2.  Start a local static server from the project root. For example, if
    Python is installed:

    ``` bash
    python -m http.server 8000
    ```

3.  Open `http://localhost:8000/` in your browser.

4.  On first load, the app checks `localStorage` for existing records.
    If none are found, it tries to fetch `assets/seed.json`. If loading
    fails, the app logs an error and starts with an empty record list.

> **Note:** The storage key is `campus_planner:data`. Clearing this key
> from browser storage removes the locally saved planner records for
> that browser origin.

## Using the app

1.  Open **Add / Edit** and enter a title, due date, duration in
    minutes, and tag.
2.  Save the record. Use **Edit** or **Delete** in the Records table to
    manage existing entries.
3.  Use the Regex search field to filter records. Search syntax is
    JavaScript regular-expression syntax, not plain-text-only search.
4.  Choose a sort order, toggle case sensitivity, or switch the duration
    display to hours.
5.  Set the weekly duration target on the Dashboard.
6.  Use **Export JSON** to download a backup named
    `campus_planner_backup.json`, or **Import JSON** to load a JSON
    array of records.

Imports replace the current record list when the file passes the app's
structural validation. Export a backup before importing if you want to
preserve the current data.

## Regex catalog

The expressions below are used by the supplied validation and search
code.

  ---------------------------------------------------------------------------------------------------
  Purpose                 Regular expression                                  Behavior
  ----------------------- --------------------------------------------------- -----------------------
  Title edge whitespace   `/^\s|\s$/`                                         Rejects a title
                                                                              beginning or ending
                                                                              with whitespace.

  Repeated spaces in      `/\s{2,}/`                                          Rejects two or more
  title                                                                       consecutive whitespace
                                                                              characters in a title.

  Duration                `/^(0|[1-9]\d*)(\.\d{1,2})?$/`                      Accepts zero or a
                                                                              non-negative integer
                                                                              without leading zeroes
                                                                              (except `0`),
                                                                              optionally followed by
                                                                              1--2 decimal places.

  Date format/range       `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/`   Checks the `YYYY-MM-DD`
                                                                              shape, month 01--12,
                                                                              and day 01--31. It does
                                                                              not verify that the day
                                                                              exists in a particular
                                                                              month.

  Tag                     `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/`                   Allows letters
                                                                              separated by single
                                                                              spaces or hyphens;
                                                                              rejects digits and
                                                                              punctuation.

  Consecutive duplicate   `/\b(\w+)\s+\1\b/i`                                 Detects the same word
  words                                                                       repeated consecutively,
                                                                              case-insensitively,
                                                                              such as `Study Study`.

  Dynamic search          `new RegExp(input, flags)`                          Compiles the search
                                                                              input as a JavaScript
                                                                              regular expression.
                                                                              Invalid patterns return
                                                                              `null` rather than
                                                                              throwing to the caller.
  ---------------------------------------------------------------------------------------------------

### Search flags

-   Default search uses `gi`: global matching and case-insensitive
    matching.
-   With **Case sensitive** enabled, search uses `g`: global matching
    and case-sensitive matching.
-   The search checks each record's `title`, `tag`, `dueDate`, and
    stringified `duration`.
-   Valid search matches are highlighted using `<mark>` elements.

Examples:

  -----------------------------------------------------------------------
  Search input                        Example use
  ----------------------------------- -----------------------------------
  `study`                             Find text containing "study"
                                      without regard to case (unless
                                      case-sensitive mode is enabled).

  `^Exam`                             Match values beginning with "Exam".

  `lab|tutorial`                      Match either "lab" or "tutorial".

  `\d{2}`                             Match a sequence of two digits.

  `[`                                 Invalid regular expression; the
                                      compiler returns `null`.
  -----------------------------------------------------------------------

Use regex syntax carefully. A malformed expression may not filter the
records as expected. Only use search patterns you understand.

## Keyboard map

The supplied JavaScript does not define custom keyboard shortcuts. Use
the browser's standard keyboard interaction:

  -----------------------------------------------------------------------
  Key / combination                   Expected interaction
  ----------------------------------- -----------------------------------
  `Tab`                               Move focus forward through links,
                                      form controls, and buttons.

  `Shift` + `Tab`                     Move focus backward.

  `Enter`                             Activate a focused link or button;
                                      submit the form when focus is on
                                      its submit button.

  `Space`                             Activate a focused button or
                                      checkbox, following standard
                                      browser behavior.

  `Arrow keys`                        Operate native controls such as
                                      select menus and date inputs, where
                                      supported by the browser.

  `Esc`                               May dismiss browser-native popups
                                      or dialogs, depending on the
                                      browser and control.
  -----------------------------------------------------------------------

The app also includes a **Skip to main content** link, which becomes
useful when navigating by keyboard. Actual focus styling depends on the
stylesheet and browser.

## Accessibility notes

Accessibility-related features present in the supplied HTML and
JavaScript include:

-   A document language (`lang="en"`) and viewport metadata.
-   A labeled main navigation landmark.
-   A skip link to `#main-content`.
-   Explicit labels for form fields and accessible labels for search and
    sorting controls.
-   Inline validation message elements with `aria-live="polite"`.
-   A live announcement region for weekly-target status; it uses polite
    announcements when under the cap and assertive announcements when
    the cap is exceeded.
-   A semantic table with column headers for planner records.
-   Native links, buttons, checkboxes, select controls, and form
    elements.

### Accessibility limitations to review

-   No custom keyboard shortcuts are defined in the supplied JavaScript.
-   Confirm that `styles/main.css` provides visible focus indicators and
    that hidden/active sections are handled accessibly.
-   Test with keyboard-only navigation and a screen reader; the presence
    of ARIA attributes alone does not guarantee a good experience.
-   Verify that import errors, delete confirmations, and validation
    messages are understandable when announced by assistive technology.
-   The source includes code paths that insert record values into
    `innerHTML`. Treat imported data as untrusted and consider using
    `textContent`/DOM node creation or proper escaping to prevent markup
    injection.

## Testing instructions

### Run the in-browser validator tests

1.  Start the local server from the project root as described in
    **Setup**.
2.  Open `http://localhost:8000/tests.html`.
3.  Read the result list and summary displayed on the page.

The supplied `tests.html` runs browser-side checks for:

-   Title validation: valid title, leading whitespace, and trailing
    whitespace.
-   Duration validation: integer, decimal, and negative value.
-   Date validation: expected format and incorrect format.
-   Tag validation: letters/spaces and digits.
-   Duplicate-word detection: repeated and non-repeated consecutive
    words.

### Manual smoke-test checklist

-   [ ] Add a record with valid values and confirm it appears in the
    Records table.
-   [ ] Try a blank title, leading/trailing whitespace, repeated spaces,
    invalid date format, negative duration, and a tag containing digits
    or punctuation.
-   [ ] Edit a record and confirm the changes persist after reloading
    the page.
-   [ ] Delete a record and test both confirming and cancelling the
    prompt.
-   [ ] Search with a valid regex, toggle case sensitivity, and check
    highlighted matches.
-   [ ] Enter an invalid regex and observe how the app behaves.
-   [ ] Test each sort option.
-   [ ] Toggle duration display between minutes and hours.
-   [ ] Change the weekly duration target and check the status message.
-   [ ] Export records, then import a valid JSON backup.
-   [ ] Try importing malformed JSON and a JSON array with invalid
    record fields.
-   [ ] Reload the page and confirm saved data is restored from
    `localStorage`.

### Test coverage and known source issues

The supplied test page covers the validator functions only; it does not
automate UI, persistence, import/export, sorting, or accessibility
tests. The source files also appear to contain a few inconsistencies
that should be checked if tests or features fail:

-   `ui.js` refers to `unitInHours` although its function parameter is
    named `uniHours`.
-   `ui.js` refers to `record.length` where the dashboard function
    receives `records`.
-   `ui.js` uses `cap-live-announcemet`, while the HTML and `state.js`
    use `cap-live-announcement`.
-   The supplied `tests.html` contains an extra closing `</script>` tag
    after the test script.
-   In `state.js`, the selector used to clear validation messages is
    `error-msg` rather than `.error-msg`, so it may not select the
    intended elements.
-   The navigation code in `state.js` derives a target ID from `href`;
    ensure the selector and target handling match the actual HTML links.

Resolve these issues in the application source separately; this README
documents the behavior visible in the supplied files rather than
silently changing the implementation.

## Data format

The app stores records as a JSON array. Each record must include these
fields:

``` json
{
  "id": "rec_123",
  "title": "Study Group",
  "dueDate": "2026-06-15",
  "duration": 60,
  "tag": "Academics",
  "createdAt": "2026-06-01T10:00:00.000Z",
  "updatedAt": "2026-06-01T10:00:00.000Z"
}
```

For import validation, the required field types are: `id` string,
`title` string, `dueDate` string, `duration` number, and `tag` string.
Timestamp fields are created by the app for new records but are not
checked by the import validator.

## Project information

-   **Application:** Campus Life Planner
-   **Purpose:** Track academic and extracurricular responsibilities.
-   **Repository:**
    [Campus_Life_Planner](https://github.com/Maxime615/Campus_Life_Planner.git)
