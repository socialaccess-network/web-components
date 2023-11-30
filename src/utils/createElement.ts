import { isFunction, isString, kebabCase, toEntries } from '@sa-net/utils'

export type ElementAttributes = Record<string, any>

export type ElementChildren = Node | string

export function createElement<TagName extends keyof HTMLElementTagNameMap>(
	tag: TagName,
	attributes?: ElementAttributes,
	...children: Array<ElementChildren | ElementChildren[]>
): HTMLElementTagNameMap[TagName]
export function createElement<Element extends HTMLElement>(
	tag: string | { tag: string; is: string },
	attributes?: ElementAttributes,
	...children: Array<ElementChildren | ElementChildren[]>
): Element
export function createElement(
	tag: string | { tag: string; is: string },
	attributes: ElementAttributes = {},
	...children: Array<ElementChildren | ElementChildren[]>
) {
	const element = isString(tag)
		? document.createElement(tag)
		: document.createElement(tag.tag, { is: tag.is })

	setAttributes(element, attributes)
	appendChildren(element, ...children)

	return element
}

export function setAttributes(
	element: HTMLElement,
	attributes: ElementAttributes
) {
	for (const [key, value] of toEntries(attributes)) {
		if (key.startsWith('on') && isFunction(value)) {
			element.addEventListener(key.slice(2).toLowerCase(), value)
		} else element.setAttribute(kebabCase(key), value)
	}
}

export function appendChildren(
	element: HTMLElement,
	...children: Array<ElementChildren | ElementChildren[]>
) {
	for (const child of children.flat()) element.append(child)
}
