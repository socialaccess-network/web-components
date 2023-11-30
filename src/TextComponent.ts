export class TextComponent extends Text {
	static leakWarningAt = 100

	#leakWarning = false

	get value() {
		return this.textContent!
	}

	set value(value: string) {
		for (const clone of this.clones) {
			clone.textContent = value
		}
	}

	constructor(value: string, public clones = new Set<TextComponent>()) {
		super(value)
		clones.add(this)
	}

	clone(detach = false) {
		if (this.clones.size >= TextComponent.leakWarningAt && !this.#leakWarning) {
			console.warn(
				`TextComponent has ${this.clones.size} clones. This may be a memory leak`
			)
			console.trace(`text: "${this.value}"`)
			this.#leakWarning = true
		}

		return new TextComponent(this.value, detach ? undefined : this.clones)
	}

	deref() {
		this.clones.delete(this)
		this.clones = new Set([this])
		return this
	}
}
