import { defaults } from '@sa-net/utils'
import {
	TextComponent,
	WebComponent,
	createElement,
	css,
	html,
} from '@sa-net/web-components'

export class TestButton extends WebComponent<{
	color: TextComponent
	onClick(this: HTMLButtonElement, event: MouseEvent): void
}> {
	static {
		this.define()
	}

	protected get props() {
		return defaults(super.props, {
			color: new TextComponent('red'),
		})
	}

	mounted() {
		setInterval(() => {
			this.props.color.value = this.props.color.value === 'red' ? 'blue' : 'red'
		}, 500)
	}

	render() {
		const style = css`
			button {
				color: ${this.props.color};
			}
		`

		const button = createElement(
			'button',
			{
				onClick: this.props.onClick,
			},
			createElement('slot')
		)

		return html` ${style} ${button} `
	}
}

export class TestComponent extends WebComponent {
	static {
		this.define()
	}

	buttonColor = new TextComponent('red')
	button = new TestButton(
		{
			color: this.buttonColor.clone(),
			onClick() {
				console.log(this.innerText)
			},
		},
		['Click Me!']
	)

	mounted(): void {
		for (let i = 0; i < 10000; i++) {
			this.buttonColor.clone()
		}
	}

	render() {
		return html`
			${css`
				h1 {
					color: ${this.buttonColor};
				}
			`}
			<h1>Test</h1>
			${this.button}
		`
	}
}
