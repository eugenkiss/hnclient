import * as React from 'react'
import * as ReactDOM from 'react-dom'
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
import {canUseDOM} from '../utils/utils'

export class Space extends React.Component {
  render() {
    // You have to use 00A0 because of JSX
    // But then line breaks are prevented
    // -> Put zero-width space after 00A0
    return '\u00A0\u200B'
  }
}

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

export const Fill = styled(Box)`
flex: 1 1 auto;
` as any

export const BoxClickable = styled(Box)`
cursor: pointer;
user-select: none;
` as any

export const FlexClickable = styled(Flex)`
cursor: pointer;
user-select: none;
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

class Portal extends React.Component {
  defaultNode = null

  componentWillUnmount() {
    if (this.defaultNode) {
      document.body.removeChild(this.defaultNode)
    }
    this.defaultNode = null
  }

  render() {
    if (!canUseDOM) {
      return null
    }
    if (this.defaultNode ==  null) {
      this.defaultNode = document.createElement('div')
      document.body.appendChild(this.defaultNode)
    }
    return ReactDOM.createPortal(
      this.props.children,
      this.defaultNode
    )
  }
}

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
