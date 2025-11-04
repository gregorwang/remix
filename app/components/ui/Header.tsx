'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogPanel,
} from '@headlessui/react'
import { Link, useOutletContext, useFetcher } from '@remix-run/react'
import { isAdmin } from '~/lib/constants';
import type { SupabaseOutletContext } from '~/lib/types';

const navigation = [
  { name: '个人简历', href: '/cv' },
  { name: '影像记忆', href: '/photo' },
  { name: '音乐之旅', href: '/music' },
  { name: '游戏世界', href: '/game' },
  { name: 'RAG-Nemesis', href: '/chat' },
  { name: '动漫回', href: '/anime' },
  { name: '日志更新', href: '/updates' },
]

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { session } = useOutletContext<SupabaseOutletContext>()
  const fetcher = useFetcher()
  
  const user = session?.user
  const userIsAdmin = isAdmin(user?.id, user?.email)
  
  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return null
    const metadata = user.user_metadata || {}
    return metadata.full_name || metadata.name || user.email?.split('@')[0] || 'User'
  }
  
  const handleSignOut = () => {
    fetcher.submit(null, { method: 'post', action: '/auth/sign-out' })
  }

  return (
    <header className="bg-primary-50">
      <nav aria-label="Global" className="mx-auto flex max-w-[90rem] items-center justify-between px-2 py-2 lg:px-2">
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-0.5 inline-flex items-center justify-center rounded px-0.75 py-0.5 text-primary-950/70 transition-[color] duration-300 ease-expo-out hover:text-primary-950"
          >
            <span className="sr-only">Open main menu</span>
            <span aria-hidden="true" className="size-6 text-lg flex items-center justify-center">☰</span>
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-1">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              to={item.href} 
              prefetch="intent"
              className="px-1.5 py-0.75 rounded text-sm font-medium text-primary-950 hover:text-accent hover:bg-primary-100 transition-[color,background-color] duration-300 ease-expo-out"
            >
              {item.name}
            </Link>
          ))}
          {userIsAdmin && (
            <Link 
              to="/admin/messages" 
              prefetch="intent"
              className="px-1.5 py-0.75 rounded text-sm font-medium text-accent hover:text-accent-hover hover:bg-primary-100 transition-[color,background-color] duration-300 ease-expo-out"
            >
              🛡️ 留言管理
            </Link>
          )}
        </div>
        <div className="hidden lg:flex lg:justify-end items-center gap-1">
          {!user ? (
            <Link 
              to="/auth" 
              prefetch="intent"
              className="px-1.5 py-0.75 rounded text-sm font-medium text-primary-950 hover:text-accent hover:bg-primary-100 transition-[color,background-color] duration-300 ease-expo-out"
            >
              登录 <span aria-hidden="true">&rarr;</span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.75 px-1 py-0.5">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {getUserDisplayName()?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-primary-950/70">
                  {getUserDisplayName()}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                disabled={fetcher.state !== 'idle'}
                className="px-1.5 py-0.75 rounded text-sm font-medium text-accent hover:text-accent-hover hover:bg-primary-100 transition-[color,background-color] duration-300 ease-expo-out disabled:opacity-50"
              >
                {fetcher.state !== 'idle' ? '退出中...' : '退出登录'}
              </button>
            </div>
          )}
        </div>
      </nav>
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-primary-50 p-1.5 sm:max-w-sm sm:ring-1 sm:ring-primary-950/10 transition-[opacity,transform] duration-600 ease-expo-out">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-0.75 rounded p-0.75 text-primary-950/70 transition-[color] duration-300 ease-expo-out hover:text-primary-950"
            >
              <span className="sr-only">Close menu</span>
              <span aria-hidden="true" className="size-6 text-lg flex items-center justify-center">✕</span>
            </button>
          </div>
          <div className="mt-1.5 flow-root">
            <div className="-my-1.5 divide-y divide-primary-950/10">
              <div className="space-y-0.75 py-1.5">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    prefetch="intent"
                    className="-mx-0.75 block rounded px-1 py-0.75 text-base font-medium text-primary-950 hover:bg-primary-100 hover:text-accent transition-[color,background-color] duration-300 ease-expo-out"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {userIsAdmin && (
                  <Link
                    to="/admin/messages"
                    prefetch="intent"
                    className="-mx-0.75 block rounded px-1 py-0.75 text-base font-medium text-accent hover:bg-primary-100 hover:text-accent-hover transition-[color,background-color] duration-300 ease-expo-out"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🛡️ 留言管理
                  </Link>
                )}
              </div>
              <div className="py-1.5">
                {!user ? (
                  <Link
                    to="/auth"
                    prefetch="intent"
                    className="-mx-0.75 block rounded px-1 py-0.75 text-base font-medium text-primary-950 hover:bg-primary-100 hover:text-accent transition-[color,background-color] duration-300 ease-expo-out"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    登录
                  </Link>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 px-1 py-0.75">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {getUserDisplayName()?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-base font-medium text-primary-950 flex-1">
                        {getUserDisplayName()}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                      disabled={fetcher.state !== 'idle'}
                      className="-mx-0.75 block w-full text-left rounded px-1 py-0.75 text-base font-medium text-accent hover:bg-primary-100 hover:text-accent-hover transition-[color,background-color] duration-300 ease-expo-out disabled:opacity-50"
                    >
                      {fetcher.state !== 'idle' ? '退出中...' : '退出登录'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}
