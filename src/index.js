import './style.css';

function createElement() {

}

function createTextElement() {

}

function render() {

}

const Didact = {
    createElement,
    render
}

// ===================== real app ====================

const element = (
    <div style="background: salmon">
        <h1>Hello World</h1>
        <h2 style="text-align:right">from Didact</h2>
    </div>
);

const container = document.getElementById('root');
Didact.render(element, container);