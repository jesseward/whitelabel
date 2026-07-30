# WhiteLabel User Guide

WhiteLabel is an album art curation and mosaic generation tool designed for music enthusiasts.

## Configuration & Settings

WhiteLabel is designed to run entirely in your browser. To enable search functionality and AI features, you need to configure your API keys.

1. Click the **Settings** (gear icon) in the top-right corner.
2. Navigate to the **API Keys** tab.
3. Enter your keys for the services you wish to use:
   - **Last.fm**: Required for the most comprehensive album art search.
   - **Discogs**: Essential for vinyl and electronic music releases.
   - **Gemini**: Required for AI style transfers and enhancements.
4. Keys are saved securely in your browser's local storage and are never sent to our servers.

You can also toggle specific providers on or off in the **Data Providers** tab.

## Advanced Search

WhiteLabel uses a multi-provider engine (Last.fm, Discogs, MusicBrainz, Apple iTunes) with structured query support.

**Provider Toggles**: You can quickly enable or disable specific providers for your search using the buttons located directly below the search bar. This allows you to narrow down your source (e.g., searching only iTunes for high-res covers).

| Format          | Example                       | Description                                              |
| :-------------- | :---------------------------- | :------------------------------------------------------- |
| **General**     | `Boards of Canada`            | Searches both Artist and Album fields.                   |
| **Artist Only** | `artist:Aphex Twin`           | Only returns results matching the specified Artist.      |
| **Album Only**  | `album:Geogaddi`              | Only returns results matching the specified Album title. |
| **Combined**    | `artist:Autechre album:Amber` | Finds the specific album by the specific artist.         |

> **Tip**: Use double quotes for exact phrase matching, e.g., `artist:"The Orb"`.

## Batch Import

You can upload a text file (`.txt`) containing a list of songs or albums (e.g., "Artist - Title") to populate your crate.

- Click the **Import** (upload icon) button in the top header. This loads the tracklist into memory (indicated by a green dot on the button).
- In the Crate panel, click **Load Tracklist** to search and load the albums.
- The app searches for matches in the exact order of the tracklist.
- Loading from a tracklist will clear your current crate to ensure the order matches the file.

## The Crate (Selection Management)

- **Add/Remove**: Click an album in the search results to add it to your crate. A checkmark will appear on selected items.
- **Reorder**: Drag and drop items within the crate to change their position in the final mosaic.
- **Persistence**: Your crate is automatically saved to your browser's local database (IndexedDB). Your work will be there even if you refresh the page.

## Mosaic Generation

Click **"Create Mosaic"** to enter the design view.

- **Layout Controls**: Adjust columns, image gap, and outer padding in real-time.
- **Backgrounds**: Choose from preset colors to match your aesthetic.
- **Responsive Preview**: The canvas scales to fit your screen while maintaining export quality.

## AI Stylist

Give your mosaic a unique look using Gemini AI.

> **Requirement**: A valid Gemini API Key in Settings.

1. **Style**: Select a preset like _Vintage Print_ or _Cyberpunk Glow_.
2. **Title**: Enter a mixtape name. The AI generates typography to match the chosen style.
3. **Enhance**: Click to reimagine your composition. The AI preserves your layout but unifies the aesthetic.

## Mixtape Generator

Create custom 1990s-style mixtape cassette tape covers using Gemini AI.

1. Switch to the **Mixtape Generator** tab in the main header.
2. **Configuration**:
   - **Mixtape Title**: Enter the main title (e.g., "Summer Daze '94").
   - **DJ / Artist Name (Optional)**: Add the creator's name.
   - **Extra Text / Info (Optional)**: Add secondary details (e.g., "Side A", "Live Mix").
3. **Cassette Style**: Choose between:
   - **90s Branded Cassette**: Classic Maxell XLII style with textured dark gray plastic casing and handwritten sticker label.
   - **90s Rave Mixtape**: Clear plastic cassette revealing tape wheels and gears, with printed neon graphics.
4. Click **Generate Mixtape Cover**.
5. Export as PNG or JPEG. The metadata (EXIF) will automatically include your title, DJ, and extra info.

## Exporting

- **Formats**: Export as high-resolution **PNG** or **JPEG**.
- **Metadata**: JPEG exports automatically include the list of all artists and albums in the file's **EXIF metadata** (UserComment field).
- **Quality**: Adjust JPEG quality to balance file size and visual fidelity.

## Themes

Use the theme toggle in the header to switch between **Light** and **Dark** modes. Your preference is saved automatically.
