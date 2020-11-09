import './style.css';

function createElement(type, props, ...children) {
    console.log('createElement: ', type, props, children);
    return {
        type,
        props: {
            ...props,
            children: children.map(child => {
                if (typeof child == 'object') {
                    return child;
                } else {
                    return createTextElement(child);
                }
            })
        }
    }
}

function createTextElement(text) {
    return {
        type: '#text',
        props: {
            nodeValue: text,
            children: []
        }
    }
}

let wipRoot = null;  // fiber
let currentRoot = null;  // ? what type?
let nextUnitOfWork = null;
let deletions = null;

function render(element, container) {
    // let node = element.type === '#text' ? document.createTextNode("") : document.createElement(element.type);
    // for (let attributeName in element.props) {
    // if(attributeName.startsWith('on')){
    //     node.addEventListener(
    //         attributeName.toLowerCase().substring(2),
    //         element.props[attributeName]
    //     )
    // }
    // else if (attributeName !== 'children') {
    //         node[attributeName] = element.props[attributeName];
    //     } else {
    //         for (let child of element.props.children) {
    //             render(child, node);
    //         }
    //     }
    // }
    // container.appendChild(node);

    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot
    }
    deletions = []
    nextUnitOfWork = wipRoot
}

const Didact = {
    createElement,
    render
}

// ===================== fiber    ====================
function workLoop(deadline) {
    console.log('loop', nextUnitOfWork)
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }

    reconcileChildren(fiber.props.children);

    if (fiber.child) {
        return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent
    }
    // return fiber + 1
}

function reconcileChildren(wipFiber, elements) {
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

    let index = 0;
    while (index < elements.length || oldFiber !== null) {
        const element = elements[index];

        const sameType =
            oldFiber &&
            element &&
            element.type === oldFiber.type
        
        let newFiber = null;
        if (sameType) {
            newFiber = {
                type: element.type,
                props: element.props,
                dom: oldFiber.dom,
                parant: wipFiber,
                alternate: oldFiber,
                effectTag: 'UPDATE'
            }
        }
    }

    // compare
}

// let time = 0;
// setTimeout(() => {
//     while (time < 20000) {
//         time++;
//         console.log('block');
//     }
// }, 2000);


// ===================== real app ====================

const container = document.getElementById('root');

const updateValue = e => {
    rerender(e.target.value);
}

const rerender = (value) => {
    const element = (
        <div>
            <input onInput={updateValue} value={value}></input>
            <h2>Hello {value}</h2>
        </div>
    )
    container.innerHTML = '';
    Didact.render(element, container);
}

rerender("World");
