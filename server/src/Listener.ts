export default class Listener {
	readonly matcher
	readonly exec
	listeners: Listener[]

	constructor (matcher: string, exec: (req: Request) => Response | undefined) {
		this.matcher = matcher
		this.listeners = []
		this.exec = exec
	}

	addListener (matcher: string, exec: (req: Request) => Response | undefined): Listener {
		const listener = new Listener(matcher, exec)
		this.listeners.push(listener)
		return listener
	}

	addGroup (path: string): Listener {
		return this.addListener(path, () => undefined)
	}

	match (str: string, req: Request): Response | undefined {
		const list = str.split('/')
		if (list.length > 1 && list[list.length - 1] === '') list.pop()
		if (list.length === 1 && list[0] === this.matcher) {
			return this.exec(req)
		}
		if (list[0] === this.matcher) {
			for (const listener of this.listeners) {
				const rest = list.slice(1).join('/')
				const resp = listener.match(rest, req)
				if (resp !== undefined) {
					return resp
				}
			}
		}
	}
}
