import * as React from 'react'
import {Component} from 'react'
import {inject, observer} from 'mobx-react'
import {css} from 'emotion'
import {A, Flex} from './basic'
import {Store} from '../store'

@inject('store') @observer
export class About extends Component<{store?: Store}> {
  render() {
    return (
      <Flex
        justify='center'
        align='center'
        className={css`
        height: 100%;
      `}>
        <A href='https://github.com/eugenkiss/hnclient'>
          https://github.com/eugenkiss/hnclient
        </A>
      </Flex>
    )
  }
}
