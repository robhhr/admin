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

const markdown = ``

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
      // onChange={() => console.log(ref.current?.getMarkdown())}
    />
  )
}
