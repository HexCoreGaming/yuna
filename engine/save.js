// [008] User settings: local device only. Not identity or authentication data.
export const saveSettings = settings=>{try{localStorage.setItem('yuna-pocket-settings',JSON.stringify(settings))}catch{}};
export const loadSettings=()=>{try{return JSON.parse(localStorage.getItem('yuna-pocket-settings'))||{})}catch{return {}}};
