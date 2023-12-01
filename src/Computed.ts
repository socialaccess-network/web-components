import { Ref } from './Ref'

export class Computed<Value> extends Ref<Value> {
	protected computeGet: () => Value
	protected computeSet?: (value: Value) => void

	constructor(get: () => Value, set?: (value: Value) => void) {
		super(null as any)

		this.computeGet = get
		this.computeSet = set
	}

	get() {
		return this.computeGet()
	}

	set(value: Value) {
		if (this.computeSet) {
			this.computeSet(value)
			this.notify(this.get())
		} else throw new Error('Cannot set a computed value without a setter')
	}
}
