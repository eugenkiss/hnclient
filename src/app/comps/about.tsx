import * as React from 'react'
import {Component} from 'react'
import {inject, observer} from 'mobx-react'
import {css} from 'emotion'
import {A, Flex, Span} from './basic'
import {Store} from '../store'
import {DATE} from '../cfg'

@inject('store') @observer
export class AboutScreen extends Component<{store?: Store}> {
  render() {
    return (
      <Flex
        f={2}
        flexDirection='column'
        justify='center'
        align='center'
        className={css`
        height: 100%;
      `}>
        <Span mb={2}>Version: {DATE.toUTCString()}</Span>
        <A href='https://github.com/eugenkiss/hnclient'>
          https://github.com/eugenkiss/hnclient
        </A>
      </Flex>
    )
  }
}
