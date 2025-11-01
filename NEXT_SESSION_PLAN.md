# 🚀 Next Session: Complete WordPress-Style Editor Integration

## ⏰ Estimated Time: 1-2 Hours

---

## 🎯 **Goal:**

Transform the contract editing from field-by-field JSON editor to **ONE unified WordPress-style document editor** where users edit the entire contract as a single beautiful HTML document.

---

## ✅ **What's Already Done:**

### **Foundation Complete:**
1. ✅ `lib/contractHTMLGenerator.ts` - Converts JSON → Formatted HTML
2. ✅ `contract_html` field in database - Stores final document
3. ✅ `download_count` field - Tracks PDF downloads
4. ✅ `contract_downloads` table - Full download history
5. ✅ `POST /api/contracts/[id]/track-download` - Records downloads
6. ✅ `GET /api/contracts/[id]/track-download` - Get statistics
7. ✅ RichTextEditor component - Word-style editing
8. ✅ Party A signature fixed - Now displays
9. ✅ All CMS keys fixed - All text in Khmer

---

## 🔨 **What Needs to Be Done:**

### **Task 1: Update Print Page Advanced Mode (30 min)**

**File:** `app/contract/print/[id]/page.tsx`

**Changes:**
1. When Advanced mode activated:
   - Don't show clickable blue sections
   - Instead, show ONE big "កែប្រែឯកសារពេញលេញ" (Edit Full Document) button

2. Click button → Full-page editor opens:
   - Not a modal
   - Takes over entire screen
   - Shows contract in editable rich text format
   - Toolbar at top (Bold, Italic, Tables, etc.)

3. Editor content:
   - If `contractData.contract_html` exists → Load it
   - If null → Generate from JSON using `generateContractHTML(contractData)`

4. Save button:
   - Saves HTML to `contract_html` field
   - API: `PUT /api/contracts/[id]/save-html`

### **Task 2: Create Save HTML API (15 min)**

**File:** `app/api/contracts/[id]/save-html/route.ts`

```typescript
export async function PUT(request, context) {
  const params = await context.params
  const { html } = await request.json()

  await prisma.contracts.update({
    where: { id: parseInt(params.id) },
    data: {
      contract_html: html,
      updated_at: new Date()
    }
  })

  return NextResponse.json({ success: true })
}
```

### **Task 3: Add Download Tracking (15 min)**

**File:** `app/contract/print/[id]/page.tsx`

**Changes:**
1. When "បោះពុម្ព" (Print) button clicked:
   ```typescript
   const handlePrint = async () => {
     // Track download
     await fetch(`/api/contracts/${params.id}/track-download`, {
       method: 'POST'
     })

     // Then print
     window.print()
   }
   ```

2. Show download counter in control panel:
   ```tsx
   <span style={{ fontSize: 12, color: '#8c8c8c' }}>
     ទាញយក: {contractData.download_count} ដង
   </span>
   ```

### **Task 4: Update Print API Response (10 min)**

**File:** `app/api/contracts/print/[id]/route.ts`

**Add to response:**
```typescript
const printData = {
  // ... existing fields
  contract_html: contract.contract_html,
  download_count: contract.download_count
}
```

### **Task 5: Test Everything (20 min)**

**Test checklist:**
- [ ] Advanced mode shows "កែប្រែឯកសារពេញលេញ" button
- [ ] Click → Full-page editor opens
- [ ] Editor shows formatted contract
- [ ] Can edit text, format, edit tables
- [ ] Save updates `contract_html` field
- [ ] Reload shows saved HTML
- [ ] Print button tracks download
- [ ] Download count increments
- [ ] Both signatures display
- [ ] All CMS keys show in Khmer

---

## 📋 **Implementation Details:**

### **Full-Page Editor Structure:**

```tsx
{editorMode === 'advanced' && editMode && showFullEditor && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: '#fff',
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column'
  }}>
    {/* Toolbar */}
    <div style={{ padding: 16, borderBottom: '1px solid #e8e8e8' }}>
      <Space>
        <Button onClick={() => setShowFullEditor(false)}>← ត្រឡប់</Button>
        <span>កែប្រែកិច្ចសន្យា #{contractData.contract_number}</span>
        <Button type="primary" onClick={handleSaveHTML}>រក្សាទុក</Button>
      </Space>
    </div>

    {/* Editor */}
    <div style={{ flex: 1, overflow: 'auto' }}>
      <RichTextEditor
        content={contractData.contract_html || generateContractHTML(contractData)}
        onSave={handleSaveHTML}
      />
    </div>
  </div>
)}
```

---

## 🎯 **Expected User Experience:**

### **WordPress-Style Editing:**

```
1. User opens /contract/print/67
2. Toggles edit mode ON
3. Clicks "កម្រិតខ្ពស់" (Advanced)
4. Sees big button: "កែប្រែឯកសារពេញលេញ"
5. Clicks → Full screen editor opens
6. Sees entire contract as one editable document
7. Edits anywhere:
   - Change title
   - Edit deliverable text
   - Format percentages
   - Edit tables
   - Change signatures layout
8. Clicks "រក្សាទុក"
9. ✅ Entire document saved as HTML
10. Next time: Opens with saved HTML (not regenerated)
11. Can keep editing and improving layout
12. When happy → Print clean PDF
13. System tracks each download
```

---

## 📊 **Database Status:**

**Already Updated:**
- ✅ `contracts.contract_html` - TEXT field
- ✅ `contracts.download_count` - INTEGER, default 0
- ✅ `contract_downloads` table - Full tracking

**No additional DB changes needed!**

---

## 🔧 **Files to Modify:**

1. `app/contract/print/[id]/page.tsx` - Main integration
2. `app/api/contracts/[id]/save-html/route.ts` - New API (create)
3. `app/api/contracts/print/[id]/route.ts` - Add contract_html, download_count

**That's it! Just 3 files.**

---

## ✨ **Why This is Better:**

**Current (Field Editor):**
- Edit 62 separate fields
- Complex forms
- Fragmented experience

**WordPress-Style (Your Vision):**
- Edit ONE document
- See entire contract
- Format freely
- Like editing a Word doc
- Much more intuitive!

---

## 🎊 **After Next Session You'll Have:**

✅ WordPress-style contract editor
✅ Edit entire document as one
✅ Beautiful clean format
✅ Download tracking (analytics)
✅ Download counter display
✅ Saved HTML for fast loading
✅ Both signatures showing
✅ All text in Khmer (no English keys)

**This will be the COMPLETE WordPress/CMS contract system!**

---

## 📝 **Notes for Next Session:**

- Current code is on branch `main`, commit `f2e735e`
- All foundation components are ready
- Just need integration work
- Estimated 1-2 hours
- Will be straightforward

**Ready to complete your vision!** 🚀
