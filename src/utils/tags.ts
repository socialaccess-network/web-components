import { isString } from '@sa-net/utils'
import { createElement } from './createElement'

const isStrict = (function () {
	// @ts-expect-error - doing some fuckery to check if strict mode is enabled
	return !this
})()

export function html(
	strings: TemplateStringsArray | string,
	...values: Array<string | Node>
) {
	let result = ''

	if (isString(strings)) result = strings
	else
		for (const [index, str] of strings.entries()) {
			result += str
			if (!values[index]) continue

			if (isString(values[index])) result += values[index]
			else result += `<value id="${index}"></value>`
		}

	const template = createElement('template', {})
	template.innerHTML = result

	const toReplace = template.content.querySelectorAll('value')

	for (const replace of toReplace) {
		const id = parseInt(replace.id)
		if (isNaN(id)) continue

		const value = values[id]
		if (!value) continue

		replace.replaceWith(value)
	}

	if (!isStrict) {
		const scripts = template.content.querySelectorAll('script')
		for (const script of scripts) {
			const newScript = createElement('script', {})

			for (const attr of script.attributes)
				newScript.attributes.setNamedItem(attr.cloneNode() as Attr)
			if (script.textContent) newScript.textContent = script.textContent

			script.replaceWith(newScript)
		}
	}

	return template.content
}

export function UNSAFE_EVAL_HTML_SCRIPTS(content: DocumentFragment) {
	const scripts = content.querySelectorAll('script')
	for (const script of scripts) {
		const newScript = createElement('script', {})

		for (const attr of script.attributes)
			newScript.attributes.setNamedItem(attr.cloneNode() as Attr)
		if (script.textContent) newScript.textContent = script.textContent

		script.replaceWith(newScript)
	}

	return content
}

export function css(
	strings: TemplateStringsArray,
	...values: Array<string | Text>
) {
	const style = createElement('style')

	for (const [index, str] of strings.entries()) {
		style.append(str)
		if (!values[index]) continue

		style.append(values[index])
	}

	return style
}
