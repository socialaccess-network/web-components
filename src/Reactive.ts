import { Ref, isReadonlyRef, isRef } from './Ref'

export type ReactiveSubscriber<Target extends Record<any, any>> = (
	this: Reactive<Target>,
	key: keyof Target,
	value: Target[keyof Target],
	oldValue?: Target[keyof Target]
) => void

export class Reactive<Target extends Record<any, any>> {
	protected subscribers = new Set<ReactiveSubscriber<Target>>()

	constructor(protected readonly target: Target) {}

	get<K extends keyof Target>(key: K): Ref.Unwrap<Target[K]> {
		const value = this.target[key]
		if (isReadonlyRef<Target[K]>(value)) return value.get()
		return value
	}

	set<K extends keyof Target>(key: K, value: Ref.Unwrap<Target[K]>): void {
		this.notify(key, value, this.target[key])
		if (isRef(this.target[key])) this.target[key].set(value)
		else this.target[key] = value as any
	}

	protected notify<Key extends keyof Target>(
		key: Key,
		value: Ref.Unwrap<Target[Key]>,
		oldValue?: Ref.Unwrap<Target[Key]>
	) {
		for (const subscriber of this.subscribers) {
			subscriber.call(this, key, value, oldValue)
		}
	}

	subscribe(callback: ReactiveSubscriber<Target>) {
		this.subscribers.add(callback)
		return () => this.subscribers.delete(callback)
	}
}
