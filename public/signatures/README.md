# Party A Signature Storage

This directory contains the official signature for Party A (Dr. Kan Puth).

## To Update the Signature:

1. Save the actual signature image as `party-a-signature.png` in this folder
2. Convert it to base64 using:
   ```bash
   base64 -i party-a-signature.png -o signature-base64.txt
   ```
3. Update the `data` field in `/lib/defaultPartyA.ts` with the base64 string:
   ```javascript
   data: 'data:image/png;base64,[paste-base64-string-here]'
   ```

## Current Signature:
The signature currently in use is an SVG approximation of Dr. Kan Puth's actual signature.
For production use, replace with the actual scanned signature image.