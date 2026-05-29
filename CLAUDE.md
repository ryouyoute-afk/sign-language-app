# Project memory

## Available connectors / capabilities

### Audio transcription
Audio transcription IS available via the **Blotato** connector
(`blotato_create_source` with `sourceType: "audio"`).

- Accepts a publicly accessible audio file **URL** (not a local file path).
- Supported formats: mp3, wav, m4a, ogg, flac, aac.
- Returns the transcript text (plus an optional summary).
- `customInstructions` can guide the output (e.g. "verbatim transcript",
  "summarize in bullet points").
- The same connector can also pull transcripts from YouTube and TikTok URLs.

Note: this transcribes from a URL. To transcribe a local file, it must first
be uploaded somewhere publicly reachable (Blotato can mint a presigned upload
URL via `blotato_create_presigned_upload_url`).
