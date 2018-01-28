import * as React from 'react'
import {Component} from 'react'
import {inject} from 'mobx-react'
import {LinkData} from '../routes'
import {Store} from '../store'
import {A} from './basic'

@inject('store')
export class Link extends Component<{
  store?: Store
  link: LinkData
  target?: string
  options?: {reload?: boolean, refresh?: boolean, replace?: boolean}
  onClick?: (e?: React.MouseEvent<{}>) => void
  unstyled?: boolean
  [key: string]: any
}> {

  render() {
    const {router} = this.props.store
    const {link, target, ...rest} = this.props
    const href = router.buildPath(link.name, link.params as any)

    return (
      <A href={href} onClick={this.onClick} target={target} {...rest}>
        {this.props.children}
      </A>
    )
  }

  onClick = (e: React.MouseEvent<{}>) => {
    const {router} = this.props.store
    if (this.props.onClick != null) this.props.onClick(e)
    if (e.button === 1 || e.metaKey || e.ctrlKey) return // Allow opening in new tab
    const {link, options} = this.props
    e.preventDefault()
    router.navigate(link.name, link.params, options)
  }
}
