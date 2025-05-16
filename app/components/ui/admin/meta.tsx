import {type MouseEvent, useState} from 'react'
import {InputText} from './input-text'
import {Button} from '~/components/modules/button'

interface ContentItem {
  label: string
  value: string
  additionalValues: string[]
  showAdditional: boolean
}

const MetaControls = () => {
  const [items, setItems] = useState<ContentItem[]>([])

  const addItem = (e: MouseEvent) => {
    e.preventDefault()
    setItems([
      ...items,
      {label: '', value: '', additionalValues: [], showAdditional: false},
    ])
  }

  const toggleAdditional = (index: number) => (e: MouseEvent) => {
    e.preventDefault()
    setItems(
      items.map((item, i) =>
        i === index ? {...item, showAdditional: !item.showAdditional} : item,
      ),
    )
  }

  const addSubItem = (index: number) => (e: MouseEvent) => {
    e.preventDefault()
    setItems(
      items.map((item, i) =>
        i === index
          ? {...item, additionalValues: [...item.additionalValues, '']}
          : item,
      ),
    )
  }

  const updateLabel = (index: number, newLabel: string) => {
    setItems(
      items.map((item, i) => (i === index ? {...item, label: newLabel} : item)),
    )
  }

  const updateValue = (index: number, newValue: string) => {
    setItems(
      items.map((item, i) => (i === index ? {...item, value: newValue} : item)),
    )
  }

  const updateSubValue = (
    index: number,
    subIndex: number,
    newSubValue: string,
  ) => {
    setItems(
      items.map((item, i) => {
        if (i === index) {
          const updatedSubs = item.additionalValues.map((sub, j) =>
            j === subIndex ? newSubValue : sub,
          )
          return {...item, additionalValues: updatedSubs}
        }
        return item
      }),
    )
  }

  return (
    <div className="flex flex-col">
      <Button onClick={addItem} className="mb-4 self-end">
        add meta item
      </Button>

      {items.map((item, index) => (
        <div key={index} className="shadow-window mb-2 flex flex-col p-2">
          <div className="flex flex-col space-x-2 md:flex-row md:items-center">
            <InputText
              value={item.label}
              placeholder="key"
              onChange={e => updateLabel(index, e.target.value)}
            />
            <InputText
              value={item.value}
              placeholder="value"
              onChange={e => updateValue(index, e.target.value)}
            />

            <div className="flex">
              <Button
                onClick={toggleAdditional(index)}
                className="mt-1.5 h-fit"
              >
                {item.showAdditional ? 'remove subitems' : 'add subitem opt'}
              </Button>

              {item.showAdditional && (
                <Button
                  onClick={addSubItem(index)}
                  className="mt-1.5 ml-2 h-fit"
                >
                  add sub-item
                </Button>
              )}
            </div>
          </div>

          <input type="hidden" name="meta" value={JSON.stringify(items)} />

          {item.showAdditional && (
            <div className="flex">
              <div className="mt-2 flex flex-col sm:ml-[152px]">
                {item.additionalValues.map((subValue, subIndex) => (
                  <div
                    key={subIndex}
                    className="mb-1 flex items-center space-x-2"
                  >
                    <InputText
                      value={subValue}
                      placeholder="sub value"
                      onChange={e =>
                        updateSubValue(index, subIndex, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default MetaControls
