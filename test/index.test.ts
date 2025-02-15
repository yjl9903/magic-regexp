import { expect, it, describe } from 'vitest'
import { expectTypeOf } from 'expect-type'

import { anyOf, char, createRegExp, exactly, global, digit, MagicRegExpMatchArray } from '../src'
import { createInput } from '../src/core/internal'

describe('magic-regexp', () => {
  it('works as a normal regexp', () => {
    const regExp = createRegExp('in', [global])
    expect('thing'.match(regExp)?.[0]).toMatchInlineSnapshot('"in"')
    expect(regExp.test('thing')).toBeTruthy()
    expect(regExp.lastIndex).toMatchInlineSnapshot('4')
  })
})

describe('inputs', () => {
  it('createInput serializes to string', () => {
    expect(`${createInput('\\s')}`).toEqual('\\s')
  })
  it('any', () => {
    const regExp = createRegExp(anyOf('foo', 'bar'))
    expect(regExp).toMatchInlineSnapshot('/\\(foo\\|bar\\)/')
    expect(regExp.test('foo')).toBeTruthy()
    expect(regExp.test('bar')).toBeTruthy()
    expect(regExp.test('baz')).toBeFalsy()
  })
  it('before', () => {
    const regExp = createRegExp(char.before('foo'))
    expect(regExp).toMatchInlineSnapshot('/\\.\\(\\?=foo\\)/')
    expect('bafoo'.match(regExp)?.[0]).toMatchInlineSnapshot('"a"')
    expect(regExp.test('foo')).toBeFalsy()
  })
  it('after', () => {
    const regExp = createRegExp(char.after('foo'))
    expect(regExp).toMatchInlineSnapshot('/\\(\\?<=foo\\)\\./')
    expect('fooafoo'.match(regExp)?.[0]).toMatchInlineSnapshot('"a"')
    expect(regExp.test('foo')).toBeFalsy()
  })
  it('notBefore', () => {
    const regExp = createRegExp(exactly('bar').notBefore('foo'))
    expect(regExp).toMatchInlineSnapshot('/bar\\(\\?!foo\\)/')
    expect('barfoo'.match(regExp)).toBeFalsy()
  })
  it('notAfter', () => {
    const regExp = createRegExp(exactly('bar').notAfter('foo'))
    expect(regExp).toMatchInlineSnapshot('/\\(\\?<!foo\\)bar/')
    expect('foobar'.match(regExp)).toBeFalsy()
    expect('fooabar'.match(regExp)).toBeTruthy()
  })
  it('exactly', () => {
    const pattern = exactly('test/thing')
    expect(pattern.toString()).toMatchInlineSnapshot('"test\\\\/thing"')
    expect(createRegExp(pattern).test('test/thing')).toBeTruthy()
  })
  it('times', () => {
    expect(exactly('test').times.between(1, 3).toString()).toMatchInlineSnapshot('"(test){1,3}"')
    expect(exactly('test').times(4).or('foo').toString()).toMatchInlineSnapshot('"((test){4}|foo)"')
  })
  it('capture groups', () => {
    const pattern = anyOf(anyOf('foo', 'bar').as('test'), exactly('baz').as('test2'))

    expect('football'.match(createRegExp(pattern))?.groups).toMatchInlineSnapshot(`
      {
        "test": "foo",
        "test2": undefined,
      }
    `)
    expect('fobazzer'.match(createRegExp(pattern))?.groups).toMatchInlineSnapshot(`
      {
        "test": undefined,
        "test2": "baz",
      }
    `)

    const regexp = createRegExp(pattern)
    expectTypeOf('fobazzer'.match(regexp)).toMatchTypeOf<MagicRegExpMatchArray<
      typeof regexp
    > | null>()
    expectTypeOf('fobazzer'.match(createRegExp(pattern))?.groups).toMatchTypeOf<
      Record<'test' | 'test2', string | undefined> | undefined
    >()

    // @ts-expect-error
    'fobazzer'.match(createRegExp(pattern))?.groups.other

    for (const match of 'fobazzer'.matchAll(createRegExp(pattern, [global]))) {
      expect(match.groups).toMatchInlineSnapshot(`
        {
          "test": undefined,
          "test2": "baz",
        }
      `)
      expectTypeOf(match.groups).toMatchTypeOf<Record<'test' | 'test2', string | undefined>>()
    }

    ''.match(
      createRegExp(
        anyOf(anyOf('foo', 'bar').as('test'), exactly('baz').as('test2')).and(
          digit.times(5).as('id').optionally()
        )
      )
    )?.groups?.id
  })
})
