# Facilitator Finder — SharePoint starter kit

This kit recreates the useful parts of the Facilitator Finder demo using only standard SharePoint Online pages, lists, images, and JSON view formatting. It does not require a custom web part or an App Catalog deployment.

The geographic map is a static visual anchor. District selection, facilitator filtering, portrait cards, hover previews, search, and native profile panels are handled by SharePoint.

## What is included

| File | Purpose |
| --- | --- |
| `Facilitator_Finder_Import_Workbook.xlsx` | Recommended import source; contains `DistrictsTable`, `FacilitatorsTable`, and an embedded setup guide. |
| `Districts.csv` | Alternative import source for the district-selector list. |
| `Facilitators.csv` | Alternative import source for the facilitator-directory list. |
| `district-gallery-format.json` | Turns the Districts list into branded selector cards with hover previews. |
| `facilitator-gallery-sample-photos.json` | Turns the Facilitators list into profile cards using the sample `PhotoURL` values. |
| `facilitator-gallery-person-field.json` | Production alternative that uses an `Employee` Person column and Microsoft 365 profile photos. |
| `district-map.png` | Static map for the top of the SharePoint page. |

## Important: the included people are fictional

All names, locations, biographies, availability, email addresses, and portraits are sample data for prototyping.

- Email addresses use the reserved `.invalid` domain and cannot receive mail.
- `PhotoURL` values use a public placeholder-image service. Remove or replace them before internal publication.
- Do not represent the sample records as real Federal Reserve employees.

## 1. Create the Districts list

From the target SharePoint site:

1. Select **New → List**.
2. Choose **From Excel** and upload `Facilitator_Finder_Import_Workbook.xlsx`.
3. Select the table named **DistrictsTable**.
4. Name the new list **Districts**.
5. Confirm the proposed column types, then create the list.

If the Excel import option is unavailable, create the list from `Districts.csv` instead.

Expected fields:

| Internal name | Recommended type |
| --- | --- |
| `Title` | Single line of text |
| `DistrictCode` | Single line of text |
| `Territory` | Single line of text |
| `FacilitatorCount` | Number, zero decimal places |
| `AccentColor` | Single line of text |
| `Summary` | Multiple lines of text |

Do not delete or recreate the imported columns after applying formatting. The JSON refers to these internal field names.

## 2. Create the Facilitators list

Repeat the import process and select **FacilitatorsTable**. Name the list **Facilitators**.

Expected fields:

| Internal name | Recommended type |
| --- | --- |
| `Title` | Single line of text; facilitator name |
| `District` | Single line of text |
| `Role` | Single line of text |
| `Location` | Single line of text |
| `Specialty1` | Single line of text |
| `Specialty2` | Single line of text |
| `Availability` | Single line of text or Choice |
| `Email` | Single line of text |
| `ProfileSummary` | Multiple lines of plain text |
| `PhotoURL` | Single line of text |

The `District` values must exactly match the `Title` values in the Districts list. This is what makes dynamic filtering work.

## 3. Apply the District selector design

1. Open the **Districts** list.
2. Open the current-view menu and choose **Create new view**.
3. Name it **District selector** and choose **Gallery**.
4. Open the view menu again and select **Format current view**.
5. Select **Gallery → Advanced mode**.
6. Replace the existing formatting with the entire contents of `district-gallery-format.json`.
7. Select **Preview**, then **Save**.

Keep item selection enabled. The small selection circle on each district card is what SharePoint uses to tell the second list which district was chosen.

## 4. Apply the facilitator-card design

1. Open the **Facilitators** list.
2. Create a Gallery view named **Facilitator cards**.
3. Choose **Format current view → Gallery → Advanced mode**.
4. Paste the entire contents of `facilitator-gallery-sample-photos.json`.
5. Preview and save.

The **View profile** button opens SharePoint's native item-details panel. Editing the list item updates both the panel and its card.

### Use real Microsoft 365 profile photos

For a production directory:

1. Add a column to the Facilitators list named exactly **Employee**.
2. Set its type to **Person or Group** and allow one person.
3. Add `Employee` to the **Facilitator cards** view. A referenced field must be included in the view, even if the formatter does not show the standard column.
4. Populate the field with the real employee associated with each record.
5. Replace the Gallery formatting with `facilitator-gallery-person-field.json`.

That formatter uses the employee's Microsoft 365 profile photo and opens the standard SharePoint profile card on portrait hover. You can then clear or delete the sample `PhotoURL` values.

## 5. Assemble the SharePoint page

Create a modern page called **Facilitator Finder**.

Recommended layout:

1. Add a **Text** web part with the heading “Find the right guide for your team.”
2. Add an **Image** web part and upload `district-map.png`.
3. Add a short instruction: “Select a district below to see available facilitators.”
4. Add a two-column section. A roughly 40/60 split works well.
5. In the left column, add a **List** web part connected to **Districts** and select the **District selector** view.
6. In the right column, add another **List** web part connected to **Facilitators** and select the **Facilitator cards** view.
7. In each List web part's settings, hide the command bar if you want the page to feel more like a directory than a data-management screen.

## 6. Connect the two lists

While the page is still in Edit mode:

1. Edit the **Facilitators** List web part.
2. Find **Dynamic filtering** and turn it on.
3. For the column to filter, choose **District**.
4. For the source list, choose the **Districts** List web part.
5. For the source column, choose **Title**.
6. Apply the settings and publish the page.

Selecting a district card now filters the facilitator cards without navigating away from the page. SharePoint also retains its built-in search, sorting, accessibility, and list-editing capabilities.

Microsoft instructions: <https://support.microsoft.com/en-us/sharepoint/libraries/dynamic-list-filtering>

## Suggested finishing touches

- Give page viewers read access to both lists and the page.
- Give directory maintainers edit access to the Facilitators list.
- Replace the fictional records before sharing beyond a prototype audience.
- Change `Availability` to a Choice column with values such as `Available this week`, `Available next week`, `Available in 2 weeks`, `Available in 3 weeks`, and `Unavailable`.
- Add saved list views grouped or filtered by specialty if people frequently browse by capability rather than district.
- Add a Power Automate button later if the intake process needs workflow, tracking, or notifications.

## Troubleshooting

### Cards show blank values

Make sure the view contains every field referenced by its JSON file. SharePoint formatting can only reference fields included in the current view.

### Pasting JSON reports an error

Confirm that the view layout is **Gallery** and that you pasted the full file, including its opening and closing braces. These formatters target SharePoint Online's v2 Gallery schema.

### Selecting a district does not filter facilitators

- Confirm that dynamic filtering is enabled on the Facilitators web part.
- Confirm the target column is `District` and the source column is `Title`.
- Confirm the district names match exactly in both lists.
- Use the district card's selection circle if clicking the card itself only opens or focuses it.

### A renamed column breaks formatting

Changing a display name is safe, but deleting and recreating a column changes its internal name. Reimport the list or update the JSON references to match the new internal name.

## Microsoft reference documentation

- Dynamic list filtering: <https://support.microsoft.com/en-us/sharepoint/libraries/dynamic-list-filtering>
- Gallery view formatting: <https://learn.microsoft.com/en-us/sharepoint/dev/declarative-customization/view-gallery-formatting>
- Formatting syntax and hover cards: <https://learn.microsoft.com/en-us/sharepoint/dev/declarative-customization/formatting-syntax-reference>
- Column formatting permissions and behavior: <https://learn.microsoft.com/en-us/sharepoint/dev/declarative-customization/column-formatting>
