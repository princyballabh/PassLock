import React from 'react'
export default function Navbar() {
  return (
    <nav className='bg-opacity-25 bg-violet-900 '>
      <div className="mycontainer text-white px-10 py-4 flex justify-between items-center">
        <div className='logo font-bold'>
        <span className='text-blue-200'>&lt;</span>
          Pass
          <span className='text-blue-200'>/Lock&gt;</span>
          </div>
        <ul>
            <li className='flex space-x-4'>
                <a href='/'>Home</a>
                <a href="#">About</a>
                <a href="#">Contact</a>
            </li>            
        </ul>
        </div>
    </nav>
  )
}
