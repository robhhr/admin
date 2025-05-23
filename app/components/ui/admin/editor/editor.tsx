import {useEffect, useRef, useState} from 'react'
import {
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  MDXEditor,
  type MDXEditorMethods,
  codeBlockPlugin,
  diffSourcePlugin,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

export const Editor = ({data}: {data?: string}) => {
  const markdown = data || ''
  const ref = useRef<MDXEditorMethods>(null)
  const [mounted, setMounted] = useState(false)
  const [content, setContent] = useState(markdown)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      <MDXEditor
        ref={ref}
        markdown={markdown}
        contentEditableClassName="prose text-editor"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          codeBlockPlugin({defaultCodeBlockLanguage: 'js'}),
          linkPlugin(),
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
        onChange={value => setContent(value)}
      />
      <input type="hidden" name="content" value={content} />
    </>
  )
}
