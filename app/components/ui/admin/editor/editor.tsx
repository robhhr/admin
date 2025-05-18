import {useEffect, useRef, useState} from 'react'
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  MDXEditor,
  type MDXEditorMethods,
  diffSourcePlugin,
  headingsPlugin,
  linkDialogPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

const markdown = `
  # Hello World
  ---
  * Item 1
  * Item 2
  * Item 3
    * nested item

  **hello**
    
  > This is a quote

  ## Hello World 2
  1. Item 1
  2. Item 2
`

export const Editor = () => {
  const ref = useRef<MDXEditorMethods>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <MDXEditor
      ref={ref}
      markdown={markdown}
      contentEditableClassName="prose text-editor"
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        linkDialogPlugin(),
        diffSourcePlugin({
          viewMode: 'source',
          readOnlyDiff: true,
        }),
        toolbarPlugin({
          toolbarClassName: 'mdx-toolbar',
          toolbarContents: () => (
            <DiffSourceToggleWrapper>
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <CreateLink />
            </DiffSourceToggleWrapper>
          ),
        }),
      ]}
      // onChange={() => console.log(ref.current?.getMarkdown())}
    />
  )
}
