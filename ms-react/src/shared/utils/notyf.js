import { Notyf } from 'notyf';

const notyf = new Notyf({
    duration: 4000,
    position: { x: 'center', y: 'top' },
    ripple: true,
    dismissible: true,
    types: [
        {type: 'success', background: 'linear-gradient(90deg,#22c55e,#16a34a)', icon: false},
        {type: 'error', background: 'linear-gradient(90deg,#ef4444,#dc2626)', icon: false},
        
    ]
})

export const notyfSuccess = (message) => notyf.success(message);
export const notyfError = (message) => notyf.error(message);
export default notyf;