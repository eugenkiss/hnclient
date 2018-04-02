import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {autorun, IObservableValue} from 'mobx'
import {IAutorunOptions} from 'mobx/lib/api/autorun'
import {IReactionPublic} from 'mobx/lib/core/reaction'
import {observer} from 'mobx-react'
import {css} from 'emotion'
import styled from 'react-emotion'
import {
  alignItems,
  alignSelf,
  background,
  borderRadius,
  borders,
  bottom,
  boxShadow,
  color,
  flex,
  flexDirection,
  flexWrap,
  fontSize,
  fontWeight,
  height,
  justifyContent,
  left,
  maxHeight,
  maxWidth,
  minHeight,
  minWidth,
  position,
  propTypes,
  right,
  space,
  style,
  styles,
  textAlign,
  top,
  util,
  width,
  zIndex,
} from 'styled-system'
import tag from 'clean-tag'
import {canUseDOM} from '../utils/utils'

export class Space extends React.Component {
  render() {
    // You have to use 00A0 because of JSX
    // But then line breaks are prevented
    // -> Put zero-width space after 00A0
    return '\u00A0\u200B'
  }
}

const vspace = props => {
  let v = props.vspace
  const theme = util.fallbackTheme(props)
  if (v == null) return undefined
  if (theme && theme.space && theme.space[v]) {
    v = util.px(theme.space[v])
  }
  return css`
    &>* {
      margin-top: ${v};
    }
    &>*:first-child {
      margin-top: 0;
    }
  `
}

const hspace = props => {
  let v = props.hspace
  const theme = util.fallbackTheme(props)
  if (v == null) return undefined
  if (theme && theme.space && theme.space[v]) {
    v = util.px(theme.space[v])
  }
  return css`
    &>* {
      margin-left: ${v};
    }
    &>*:first-child {
      margin-left: 0;
    }
  `
}

// TODO: Is there an easy way to say 'apply all of the styles to this styled-component'?
export const Box = styled(tag)`
${vspace} ${hspace}
${space}
${width} ${height}
${minWidth} ${maxWidth} ${minHeight} ${maxHeight}
${fontSize}
${fontWeight}
${color}
${flex}
${textAlign}
${background}
${borders} ${borderRadius}
${boxShadow}
${position} ${zIndex} ${left} ${top} ${right} ${bottom}
` as any

export const Flex = styled(Box)`
display: flex;
${alignItems}
${justifyContent}
${flexWrap}
${flexDirection}
${alignSelf}
` as any

export const VFlex = styled(Flex)`
` as any
VFlex.defaultProps = {
  flexDirection: 'column'
}

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

export const Span = styled(Box.withComponent(tag.span))`
display: inline-block;
` as any

export const A = styled(props => <a target='_blank' rel='noopener' {...props}/>)`
${space} 
${width} 
${fontSize}
${fontWeight}
${color} 
${flex}
` as any

export class Comp<P = {}, S = {}> extends React.Component<P, S> {
  disposers = []

  autorun = (view: (r: IReactionPublic) => any, opts?: IAutorunOptions) =>
    this.disposers.push(autorun(view, opts))

  componentWillUnmount() {
    for (const disposer of this.disposers) disposer()
  }
}

export class Stack extends React.Component {
  render() {
    const [first, ...rest] = React.Children.toArray(this.props.children)
    if (first == null) return null
    return (
      <Box
        className={css`
        position: relative;
        &>*:not(:first-child) {
          position: absolute;
          top: 0;
          left: 0;
        }
      `}>
        {first}
        {rest && <Stack>{rest}</Stack>}
      </Box>
    )
  }
}

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
