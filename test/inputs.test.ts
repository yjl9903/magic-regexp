import { expect, it, describe } from 'vitest'
import { expectTypeOf } from 'expect-type'
import { extractRegExp } from './utils'

import {
  anyOf,
  char,
  exactly,
  charIn,
  not,
  maybe,
  oneOrMore,
  word,
  digit,
  whitespace,
  letter,
  tab,
  linefeed,
  carriageReturn,
  charNotIn,
} from '../src/core/inputs'

describe('inputs', () => {
  it('charIn', () => {
    const input = charIn('fo]^')
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[fo\\\\\\]\\\\\\^\\]/')
    expectTypeOf(extractRegExp(input)).toMatchTypeOf<'[fo\\]\\^]'>()
  })
  it('charNotIn', () => {
    const input = charNotIn('fo^-')
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[\\^fo\\\\\\^\\\\-\\]/')
    expectTypeOf(extractRegExp(input)).toMatchTypeOf<'[^fo\\^\\-]'>()
  })
  it('anyOf', () => {
    const values = ['foo', 'bar', 'baz'] as const
    const input = anyOf(...values)
    const regexp = new RegExp(input as any)
    expect(regexp).toMatchInlineSnapshot('/\\(foo\\|bar\\|baz\\)/')
    expectTypeOf(extractRegExp(input)).toMatchTypeOf<'(foo|bar|baz)'>()
    for (const value of values) {
      expect(regexp.test(value)).toBeTruthy()
    }
    expect(regexp.test('qux')).toBeFalsy()
  })
  it('char', () => {
    const input = char
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\./')
    expectTypeOf(extractRegExp(input)).toMatchTypeOf<'.'>()
  })
  it('maybe', () => {
    const input = maybe('foo')
    const regexp = new RegExp(input as any)
    expect(regexp).toMatchInlineSnapshot('/\\(foo\\)\\?/')
    expectTypeOf(extractRegExp(input)).toMatchTypeOf<'(foo)?'>()
  })
  it('oneOrMore', () => {
    const input = oneOrMore('foo')
    const regexp = new RegExp(input as any)
    expect(regexp).toMatchInlineSnapshot('/\\(foo\\)\\+/')
    expectTypeOf(extractRegExp(input)).toMatchTypeOf<'(foo)+'>()
  })
  it('exactly', () => {
    const input = exactly('fo?[a-z]{2}/o?')
    expect(new RegExp(input as any)).toMatchInlineSnapshot(
      '/fo\\\\\\?\\\\\\[a-z\\\\\\]\\\\\\{2\\\\\\}\\\\/o\\\\\\?/'
    )
    expectTypeOf(extractRegExp(input)).toMatchTypeOf<'fo\\?\\[a-z\\]\\{2\\}\\/o\\?'>()
  })
  it('word', () => {
    const input = word
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\w/')
    expectTypeOf(extractRegExp(input)).toMatchTypeOf<'\\w'>()
  })
  it('digit', () => {
    const input = digit
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\d/')
    expectTypeOf(extractRegExp(input)).toMatchTypeOf<'\\d'>()
  })
  it('whitespace', () => {
    const input = whitespace
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\s/')
    expectTypeOf(extractRegExp(input)).toMatchTypeOf<'\\s'>()
  })
  it('letter', () => {
    const input = letter
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[a-zA-Z\\]/')
    expectTypeOf(extractRegExp(input)).toMatchTypeOf<'[a-zA-Z]'>()
  })
  it('tab', () => {
    const input = tab
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\t/')
    expectTypeOf(extractRegExp(input)).toMatchTypeOf<'\\t'>()
  })
  it('linefeed', () => {
    const input = linefeed
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\n/')
    expectTypeOf(extractRegExp(input)).toMatchTypeOf<'\\n'>()
  })
  it('carriageReturn', () => {
    const input = carriageReturn
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\r/')
    expectTypeOf(extractRegExp(input)).toMatchTypeOf<'\\r'>()
  })
  it('not', () => {
    expect(not.word.toString()).toMatchInlineSnapshot('"\\\\W"')
    expectTypeOf(extractRegExp(not.word)).toMatchTypeOf<'\\W'>()
    expect(not.digit.toString()).toMatchInlineSnapshot('"\\\\D"')
    expectTypeOf(extractRegExp(not.digit)).toMatchTypeOf<'\\D'>()
    expect(not.whitespace.toString()).toMatchInlineSnapshot('"\\\\S"')
    expectTypeOf(extractRegExp(not.whitespace)).toMatchTypeOf<'\\S'>()
    expect(not.letter.toString()).toMatchInlineSnapshot('"[^a-zA-Z]"')
    expectTypeOf(extractRegExp(not.letter)).toMatchTypeOf<'[^a-zA-Z]'>()
    expect(not.tab.toString()).toMatchInlineSnapshot('"[^\\\\t]"')
    expectTypeOf(extractRegExp(not.tab)).toMatchTypeOf<'[^\\t]'>()
    expect(not.linefeed.toString()).toMatchInlineSnapshot('"[^\\\\n]"')
    expectTypeOf(extractRegExp(not.linefeed)).toMatchTypeOf<'[^\\n]'>()
    expect(not.carriageReturn.toString()).toMatchInlineSnapshot('"[^\\\\r]"')
    expectTypeOf(extractRegExp(not.carriageReturn)).toMatchTypeOf<'[^\\r]'>()
  })
})

describe('chained inputs', () => {
  const input = exactly('?')
  it('and', () => {
    const val = input.and('test.js')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?test\\\\\\.js/')
    expectTypeOf(extractRegExp(val)).toMatchTypeOf<'\\?test\\.js'>()
  })
  it('or', () => {
    const val = input.or('test.js')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\\\\\?\\|test\\\\\\.js\\)/')
    expectTypeOf(extractRegExp(val)).toMatchTypeOf<'(\\?|test\\.js)'>()
  })
  it('after', () => {
    const val = input.after('test.js')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?<=test\\\\\\.js\\)\\\\\\?/')
    expectTypeOf(extractRegExp(val)).toMatchTypeOf<'(?<=test\\.js)\\?'>()
  })
  it('before', () => {
    const val = input.before('test.js')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\(\\?=test\\\\\\.js\\)/')
    expectTypeOf(extractRegExp(val)).toMatchTypeOf<'\\?(?=test\\.js)'>()
  })
  it('notAfter', () => {
    const val = input.notAfter('test.js')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?<!test\\\\\\.js\\)\\\\\\?/')
    expectTypeOf(extractRegExp(val)).toMatchTypeOf<'(?<!test\\.js)\\?'>()
  })
  it('notBefore', () => {
    const val = input.notBefore('test.js')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\(\\?!test\\\\\\.js\\)/')
    expectTypeOf(extractRegExp(val)).toMatchTypeOf<'\\?(?!test\\.js)'>()
  })
  it('times', () => {
    const val = input.times(500)
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\\\\\?\\)\\{500\\}/')
    expectTypeOf(extractRegExp(val)).toMatchTypeOf<'(\\?){500}'>()
  })
  it('times.any', () => {
    const val = input.times.any()
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\\\\\?\\)\\*/')
    expectTypeOf(extractRegExp(val)).toMatchTypeOf<'(\\?)*'>()
  })
  it('times.atLeast', () => {
    const val = input.times.atLeast(2)
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\\\\\?\\)\\{2,\\}/')
    expectTypeOf(extractRegExp(val)).toMatchTypeOf<'(\\?){2,}'>()
  })
  it('times.between', () => {
    const val = input.times.between(3, 5)
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\\\\\?\\)\\{3,5\\}/')
    expectTypeOf(extractRegExp(val)).toMatchTypeOf<'(\\?){3,5}'>()
  })
  it('optionally', () => {
    const val = input.optionally()
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\\\\\?\\)\\?/')
    expectTypeOf(extractRegExp(val)).toMatchTypeOf<'(\\?)?'>()
  })
  it('as', () => {
    const val = input.as('test')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?<test>\\\\\\?\\)/')
    expectTypeOf(extractRegExp(val)).toMatchTypeOf<'(?<test>\\?)'>()
  })
  it('at.lineStart', () => {
    const val = input.at.lineStart()
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\^\\\\\\?/')
    expectTypeOf(extractRegExp(val)).toMatchTypeOf<'^\\?'>()
  })
  it('at.lineEnd', () => {
    const val = input.at.lineEnd()
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\$/')
    expectTypeOf(extractRegExp(val)).toMatchTypeOf<'\\?$'>()
  })
})
