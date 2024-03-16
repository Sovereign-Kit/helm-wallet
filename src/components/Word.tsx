interface WordProps {
  left?: number
  onChange?: (arg0: any) => void
  right?: string
  text?: string
}

export default function Word({ left, onChange, right, text }: WordProps) {
  const className = 'w-full p-3 text-sm text-left font-semibold rounded-md bg-gray-100 text-gray-800'

  return (
    <fieldset className='w-full'>
      <div className='flex text-gray-100'>
        {left ? <p className='w-16 pt-3 mx-auto text-sm rounded-l-md bg-gray-700'>{left}</p> : null}
        {onChange ? (
          <input className={className} onChange={onChange} value={text} />
        ) : (
          <p className={className}>{text}</p>
        )}
        {right ? (
          <span className='flex items-center px-3 pointer-events-none text-sm rounded-r-md bg-gray-700'>{right}</span>
        ) : null}
      </div>
    </fieldset>
  )
}
