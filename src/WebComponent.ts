import { isArray, isPromise, kebabCase } from '@sa-net/utils'
import {
	ElementAttributes,
	ElementChildren,
	appendChildren,
	createElement,
	setAttributes,
} from './utils/createElement'
import { UNSAFE_EVAL_HTML_SCRIPTS, html } from './utils/tags'

export namespace WebComponent {
	export type RenderItem = Node | string | void | null | undefined
	export type RenderResult = RenderItem | Array<RenderItem>
}

export abstract class WebComponent<
	Props extends ElementAttributes = any
> extends HTMLElement {
	static readonly inheritAttrs: boolean = false

	static get tagName() {
		return kebabCase(this.name)
	}

	static define<WC extends WebComponent<any>>(
		this: WebComponentClass<WC>,
		name?: string
	) {
		customElements.define(name ?? this.tagName, this)
	}

	// type only property
	declare '@props': Props

	#isMounted = false
	get isMounted() {
		return this.#isMounted
	}

	#props: Partial<Props>
	protected get props(): Partial<Props> {
		return this.#props
	}

	templateURL?: URL
	styleURL?: URL | URL[]

	globalStyleURL?: URL | URL[]
	globalStyleLinks = new Set<HTMLLinkElement>()

	protected readonly UNSAFE_EVAL_TEMPLATE_SCRIPTS: boolean = false

	get shadow() {
		return this.shadowRoot!
	}

	constructor(
		props: Props = {} as any,
		...children: Array<ElementChildren | ElementChildren[]>
	) {
		super()
		this.attachShadow({ mode: 'open' })

		this.#props = props
		if (new.target.inheritAttrs) setAttributes(this, props)
		appendChildren(this, ...children)
	}

	mounted?(): void
	connectedCallback() {
		if (this.#isMounted) return
		this.#isMounted = true

		if (this.globalStyleURL)
			if (isArray(this.globalStyleURL))
				for (const url of this.globalStyleURL) this.attachStyleLink(url, true)
			else this.attachStyleLink(this.globalStyleURL, true)

		if (this.styleURL)
			if (isArray(this.styleURL))
				for (const url of this.styleURL) this.attachStyleLink(url)
			else this.attachStyleLink(this.styleURL)

		const content = this.render()
		const append = (content: WebComponent.RenderResult) => {
			if (!content) return
			else if (isArray(content))
				for (const child of content) {
					if (child) this.shadow.append(child)
				}
			else this.shadow.append(content)
		}

		if (isPromise(content)) content.then(append)
		else append(content)

		if (this.mounted) this.mounted()
	}

	updated?(name: string, oldValue: any, newValue: any): void | Promise<void>
	attributeChangedCallback(name: string, oldValue: any, newValue: any) {
		if (this.updated) return this.updated(name, oldValue, newValue)
	}

	unmounted?(): void
	disconnectedCallback() {
		if (!this.#isMounted) return
		this.#isMounted = false

		for (const link of this.globalStyleLinks) {
			link.remove()
			this.globalStyleLinks.delete(link)
		}

		for (const child of this.shadow.childNodes) child.remove()

		if (this.unmounted) this.unmounted()
	}

	adopted?(): void
	adoptedCallback() {
		if (!this.#isMounted) return
		if (this.adopted) this.adopted()
	}

	attachStyleLink(url: URL, global = false) {
		const link = createElement('link', {
			rel: 'stylesheet',
			href: url.href,
		})

		if (global) {
			this.globalStyleLinks.add(link)
			document.head.prepend(link)
		} else this.shadow.prepend(link)
	}

	render(): WebComponent.RenderResult | Promise<WebComponent.RenderResult> {
		if (!this.templateURL) return
		return this.fetchTemplate(this.templateURL).then(template => {
			const content = html(template)
			if (this.UNSAFE_EVAL_TEMPLATE_SCRIPTS)
				return UNSAFE_EVAL_HTML_SCRIPTS(content)
			else return content
		})
	}

	protected async fetchTemplate(url: URL) {
		const res = await fetch(url.href)
		if (!res.ok) throw new Error(`Failed to fetch template: ${url.href}`)
		return res.text()
	}
}

export type WebComponentClass<WC extends WebComponent<any>> = (new (
	props?: WC['@props'],
	...children: ElementChildren[]
) => WC) & {
	[K in keyof typeof WebComponent]: (typeof WebComponent)[K]
}
