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

function render(element, container) {
    let node = element.type === '#text' ? document.createTextNode("") : document.createElement(element.type);
    for (let attributeName in element.props) {
    if(attributeName.startsWith('on')){
        node.addEventListener(
            attributeName.toLowerCase().substring(2),
            element.props[attributeName]
        )
    }
    else if (attributeName !== 'children') {
            node[attributeName] = element.props[attributeName];
        } else {
            for (let child of element.props.children) {
                render(child, node);
            }
        }
    }
    container.appendChild(node);
}

const Didact = {
    createElement,
    render
}

// ===================== fiber    ====================
let nextUnitOfWork = 0;
function workLoop(deadline) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
    console.log(fiber);
    return fiber + 1
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
