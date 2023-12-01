import {
	Computed,
	Reactive,
	Ref,
	TextComponent,
	WebComponent,
	html,
} from '@sa-net/web-components'

export class ReactiveText extends WebComponent {
	static {
		this.define()
	}

	protected label: TextComponent

	onValueChange = (value: string) => {
		this.label.value = value
	}

	constructor(public readonly text: Ref<string>) {
		super()
		this.label = new TextComponent(text.get())
	}

	mounted() {
		console.log('mounted')
		this.text.sub(this.onValueChange)
	}

	unmounted() {
		console.log('unmounted')
		this.text.unsub(this.onValueChange)
	}

	render() {
		return this.label
	}
}

export class TestButton extends WebComponent<{
	label: Ref<string>
}> {
	static {
		this.define()
	}

	get label() {
		return this.props.label ?? new Ref('')
	}

	render() {
		const label = new ReactiveText(this.label)
		return html`<button>${label}</button>`
	}
}

export class TestComponent extends WebComponent {
	static {
		this.define()
	}

	test = new Computed(
		() => this.state.get('test') + this.state.get('foo'),
		value => this.state.set('test', value)
	)

	state = new Reactive({
		test: 'hello',
		foo: new Ref('bar'),
	})

	button = new TestButton({
		label: this.test,
	})

	mounted() {
		setTimeout(() => {
			this.test.set('world')
		}, 1000)

		setTimeout(() => {
			this.button.remove()
		}, 2000)

		setTimeout(() => {
			this.shadow.append(this.button)
		}, 3000)

		setTimeout(() => {
			this.test.set('hello')
		}, 4000)
	}

	render() {
		return this.button
	}
}
