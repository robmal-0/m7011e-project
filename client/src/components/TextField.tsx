import React from 'react'

type props = {
    name: string
    password?: boolean
}

export default function ({ name, password }: props) {
    return <>
        <input type={password? 'password': 'text'} className='text-gray-700 w-full border border-gray-600 h-8 rounded-md outline-none p-2' autoComplete={name} name={name} key={name}/>
    </>
}
