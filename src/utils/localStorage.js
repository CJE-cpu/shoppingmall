export const savelocal = (key, value) => {
    window.localStorage.setItem(key, JSON.stringify(value))
}

export const loadlocal = (key, fallback = null) => {
    try{
        return JSON.parse(window.localStorage.getItem(key)) ?? fallback
    }catch{
        return fallback
    }
}