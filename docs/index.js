/**
 * @typedef {object} State
 * @property {number[]} cells1
 * @property {number[]} cells2
 * @property {number} buffer
 * @property {number} phase
 * @property {number} generations
 * @property {boolean} running
 */
undefined

const canvasWidth = 160
const canvasHeight = 90
const canvasFrameRate = 15
const canvasElement = document.querySelector("canvas")
const canvasContext = canvasElement.getContext("2d", {
    desynchronized: true
})
const infoElement = document.querySelector("span.info")

/** */
function initialize() {
    let state = {}

    resize()
    reset(state)
    render(state)
    update(state)

    let mainElement = document.querySelector("main")

    mainElement.hidden = false
    mainElement.addEventListener("click", (event) => {
        if (event.isTrusted && event.button === 0) {
            if (event.shiftKey) {
                reset(state)
                return
            }

            state.running = state.running === false
        }
    })

    window.addEventListener("resize", (event) => {
        if (event.isTrusted) {
            resize()
        }
    })
}

/** */
function resize() {
    let width = 0
    let height = 0

    // eslint-disable-next-line no-constant-condition
    while (true) {
        let nextWidth = width + canvasWidth
        let nextHeight = height + canvasHeight
        let containerWidth = document.documentElement.clientWidth - 80
        let containerHeight = document.documentElement.clientHeight - 160

        if (nextWidth < containerWidth && nextHeight < containerHeight) {
            width = nextWidth
            height = nextHeight
            continue
        }

        break
    }

    canvasElement.width = canvasWidth
    canvasElement.height = canvasHeight
    canvasElement.style.width = width + "px"
    canvasElement.style.height = height + "px"
}

/**
 * @param {State} state
 */
function reset(state) {
    state.cells1 = []
    state.cells2 = []
    state.buffer = 0
    state.phase = 0
    state.generations = 0
    state.running = true

    for (let i = 0, n = canvasWidth * canvasHeight; i < n; i ++) {
        state.cells1[i] = Math.random() >= 0.8 ? 1 : 0
        state.cells2[i] = 0
    }
}

/**
 * @param {State} state
 */
function update(state) {
    window.requestAnimationFrame(() => update(state))

    if (state.running === false) {
        return
    }

    if (state.phase >= 60 / canvasFrameRate) {
        state.phase = 0

        let source = state.buffer === 0 ? state.cells1 : state.cells2
        let output = state.buffer === 0 ? state.cells2 : state.cells1

        for (let i = 0; i < source.length; i ++) {
            let x = (i % canvasWidth) | 0
            let y = (i / canvasWidth) | 0

            output[i] = updateCell(source[i], x, y, source)
        }

        render(state)

        state.buffer = state.buffer === 0 ? 1 : 0
        state.generations ++

        infoElement.innerText = state.generations.toString()
    }

    state.phase ++
}

/**
 * @param {number} cell
 * @param {number} x
 * @param {number} y
 * @param {number[]} source
 * @returns {number}
 */
function updateCell(cell, x, y, source) {
    let cx = 0
    let cy = 0
    let cn = 0 - cell

    for (let u = x - 1, umax = x + 1; u <= umax; u ++) {
        cx = u

        if (cx < 0) {
            cx = cx + canvasWidth
        } else if (cx >= canvasWidth) {
            cx = cx - canvasWidth
        }

        for (let v = y - 1, vmax = y + 1; v <= vmax; v ++) {
            cy = v

            if (cy < 0) {
                cy = cy + canvasHeight
            } else if (cy >= canvasHeight) {
                cy = cy - canvasHeight
            }

            cn = cn + source[cx + cy * canvasWidth]
        }
    }

    if (cell === 1) {
        if (cn === 2 || cn === 3) {
            return 1
        }
    } else if (cn === 3) {
        return 1
    }

    return 0
}

/**
 * @param {State} state
 */
function render(state) {
    canvasContext.fillStyle = "rgb(180, 160, 120)"
    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight)

    let source = state.buffer === 0 ? state.cells2 : state.cells1

    for (let i = 0; i < source.length; i ++) {
        if (source[i] === 1) {
            let x = (i % canvasWidth) | 0
            let y = (i / canvasWidth) | 0

            canvasContext.fillRect(x, y, 1, 1)
        }
    }
}

initialize()
