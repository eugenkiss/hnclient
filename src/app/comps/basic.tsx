import * as React from 'react'
import * as ReactPortal from 'react-portal'
import styled from 'react-emotion'
import {
  alignItems,
  alignSelf,
  color,
  flex,
  flexDirection,
  flexWrap,
  fontSize,
  fontWeight,
  justifyContent,
  space,
  width
} from 'styled-system'
import {autorun, IObservableValue} from 'mobx'
import {observer} from 'mobx-react'
import {css} from 'emotion'

export class Space extends React.Component {
  render() {
    // You have to use 00A0 because of JSX
    // But then line breaks are prevented
    // -> Put zero-width space after 00A0
    return '\u00A0\u200B'
  }
}

export const Fill = styled('div')`
flex: 1 1 auto;
`

export const Box = styled('div')`
${space} 
${width}
${fontSize}
${fontWeight}
${color} 
${flex}
` as any

export const Flex = styled('div')`
display: flex;
${space}
${width}
${fontSize}
${color}
${flex}
${alignItems}
${justifyContent}
${flexWrap}
${flexDirection}
${alignSelf}
` as any

export const A = styled(props => <a target='_blank' rel='noopener' {...props}/>)`
${space} 
${width} 
${fontSize}
${fontWeight}
${color} 
${flex}
` as any

export const Span = styled('span')`
${space} 
${width} 
${fontSize}
${fontWeight}
${color} 
${flex}
` as any

export const Portal = ReactPortal.Portal

@observer
export class Overlay extends React.Component<{
  isOpen: IObservableValue<boolean>
  onClick: (e: any) => void
}> {
  disposers = []

  bodyCss = css`
    overflow: hidden;
  `

  componentDidMount() {
    this.disposers.push(autorun(() => {
      const { isOpen } = this.props
      if (isOpen) {
        document.body.classList.add(this.bodyCss)
      } else {
        document.body.classList.remove(this.bodyCss)
      }
    }))
  }

  componentWillUnmount() {
    if (document != null) document.body.classList.remove(this.bodyCss)
    for (const disposer of this.disposers) {
      disposer()
    }
  }

  render() {
    const { isOpen, onClick, children } = this.props
    if (!isOpen.get()) return null
    return (
      <Portal>
        <Box onClick={onClick} className={css`
          position: fixed;
          z-index: 99999;
          right: 0;
          left: 0;
          top: 0;
          bottom: 0;
        `}>
          {children}
        </Box>
      </Portal>
    )
  }
}
