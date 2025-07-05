'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogPanel,
} from '@headlessui/react'
import { Link, useOutletContext, useFetcher } from '@remix-run/react'
import { isAdmin } from '~/lib/constants';
import { AuroraText } from '~/components/common/magicui/aurora-text';
import type { SupabaseOutletContext } from '~/lib/types';

const navigation = [
  { name: '个人简历', href: '/cv' },
  { name: '影像记忆', href: '/photo' },
  { name: '音乐之旅', href: '/music' },
  { name: '游戏世界', href: '/game' },
  { name: 'RAG-Nemesis', href: '/chat' },
  { name: '动漫回', href: '/anime' },
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
    <header className="bg-white">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link to="/" prefetch="intent" className="-m-1.5 p-1.5">
            <div className="text-3xl font-bold text-gray-900">
              GREGOR<AuroraText className="text-3xl font-bold">WANG</AuroraText>
            </div>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <span aria-hidden="true" className="size-6 text-lg flex items-center justify-center">☰</span>
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              to={item.href} 
              prefetch="intent"
              className="text-sm/6 font-semibold text-gray-900 hover:text-gray-600 transition-colors"
            >
              {item.name}
            </Link>
          ))}
          {userIsAdmin && (
            <Link 
              to="/admin/messages" 
              prefetch="intent"
              className="text-sm/6 font-semibold text-red-600 hover:text-red-700 relative transition-colors"
            >
              🛡️ 留言管理
            </Link>
          )}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-4">
          {!user ? (
            <Link 
              to="/auth" 
              prefetch="intent"
              className="text-sm/6 font-semibold text-gray-900 hover:text-gray-600 transition-colors"
            >
              登录 <span aria-hidden="true">&rarr;</span>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {getUserDisplayName()?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {getUserDisplayName()}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                disabled={fetcher.state !== 'idle'}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                {fetcher.state !== 'idle' ? '退出中...' : '退出登录'}
              </button>
            </div>
          )}
        </div>
      </nav>
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" prefetch="intent" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
              <div className="text-3xl font-bold text-gray-900">
                GREGOR<AuroraText className="text-3xl font-bold">WANG</AuroraText>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <span aria-hidden="true" className="size-6 text-lg flex items-center justify-center">✕</span>
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    prefetch="intent"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {userIsAdmin && (
                  <Link
                    to="/admin/messages"
                    prefetch="intent"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🛡️ 留言管理
                  </Link>
                )}
              </div>
              <div className="py-6">
                {!user ? (
                  <Link
                    to="/auth"
                    prefetch="intent"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    登录
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {getUserDisplayName()?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-base font-medium text-gray-900 flex-1">
                        {getUserDisplayName()}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                      disabled={fetcher.state !== 'idle'}
                      className="-mx-3 block w-full text-left rounded-lg px-3 py-2.5 text-base/7 font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
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
