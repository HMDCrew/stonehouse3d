export const customEvent = (target, eventName, content) => {

    const event = new CustomEvent(eventName, {
        bubbles: true,
        detail: content,
    })

    target.dispatchEvent(event)
}