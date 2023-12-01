export class ReadonlyRef<Value> {
	protected current: Value

	constructor(value: Value) {
		this.current = value
	}

	get() {
		return this.current
	}
}

export namespace Ref {
	export type Subscriber<Value> = (value: Value) => void

	export type Unwrap<Value> = Value extends Ref<infer Unwrapped>
		? Unwrapped
		: Value
}

export class Ref<Value> extends ReadonlyRef<Value> {
	protected subscribers = new Set<Ref.Subscriber<Value>>()

	set(value: Value) {
		this.current = value
		this.notify(value)
	}

	protected notify(newValue: Value) {
		for (const subscriber of this.subscribers) {
			subscriber(newValue)
		}
	}

	sub(callback: Ref.Subscriber<Value>) {
		this.subscribers.add(callback)
		return () => this.unsub(callback)
	}

	unsub(callback: Ref.Subscriber<Value>) {
		this.subscribers.delete(callback)
	}
}

export function isReadonlyRef<Value>(
	value: unknown
): value is ReadonlyRef<Value> {
	return value instanceof ReadonlyRef
}

export function isRef<Value>(value: unknown): value is Ref<Value> {
	return value instanceof Ref
}
