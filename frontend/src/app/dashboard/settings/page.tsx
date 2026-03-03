"use client"

import { FileWarningIcon, ImageIcon, LockKeyhole, SubscriptIcon } from 'lucide-react';
import React, { useState } from 'react';

export default function SettingsPage() {
  const [showAlert, setShowAlert] = useState(false);

  const handleSave = () => {
    setShowAlert(true);
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      {showAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-8 max-w-md w-full shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] dark:shadow-[24px_24px_0px_0px_rgba(255,255,255,1)]">
            <div className="flex items-center gap-4 mb-6 text-red-600 dark:text-red-400">
              <FileWarningIcon/>
              <h4 className="text-2xl font-black uppercase tracking-tighter">Danger Alert</h4>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 leading-relaxed">
              You are about to modify critical account settings. This action may affect your active podcast distribution feeds. Are you sure you want to proceed?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowAlert(false)}
                className="flex-1 py-4 border-2 border-black dark:border-white font-black uppercase tracking-widest text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowAlert(false)}
                className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs hover:invert transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="mb-6 md:mb-8">
        <h2 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase leading-none">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-4 font-bold uppercase text-[10px] md:text-sm tracking-[0.2em]">Manage your account and preferences</p>
      </header>

      <div className="h-1 bg-black dark:bg-white mb-10 md:mb-16 hidden md:block" />

      <div className="space-y-10 md:space-y-16">
        <section className="bg-white dark:bg-black p-6 md:p-12 rounded-none border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] dark:md:shadow-[16px_16px_0px_0px_rgba(255,255,255,1)]">
          <h3 className="text-2xl md:text-4xl font-black mb-8 md:mb-12 uppercase tracking-tight">Profile</h3>
          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
            <div className="flex flex-col items-center md:items-start gap-6">
              <div className="size-32 md:size-48 shrink-0 rounded-none bg-slate-100 dark:bg-slate-900 border-4 border-black dark:border-white flex items-center justify-center overflow-hidden relative group">
                <img src="https://picsum.photos/seed/user123/400/400?grayscale" alt="Profile" className="grayscale w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <ImageIcon/>
                </div>
              </div>
              <button className="text-xs font-black uppercase tracking-[0.2em] hover:underline">Change Photo</button>
            </div>
            <div className="flex-1 space-y-8 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Display Name</label>
                  <input className="w-full rounded-none border-4 border-black dark:border-white dark:bg-black focus:ring-0 focus:border-black dark:focus:border-white text-base p-5 font-bold uppercase" type="text" defaultValue="Alex Rivera" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Email Address</label>
                  <input className="w-full rounded-none border-4 border-black dark:border-white dark:bg-black focus:ring-0 focus:border-black dark:focus:border-white text-base p-5 font-bold uppercase" type="email" defaultValue="alex@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Bio</label>
                <textarea className="w-full rounded-none border-4 border-black dark:border-white dark:bg-black focus:ring-0 focus:border-black dark:focus:border-white text-base p-5 font-medium leading-relaxed" rows={4} defaultValue="Tech enthusiast and podcast host sharing insights on modern development." />
              </div>
              <div className="pt-6">
                <button 
                  onClick={handleSave}
                  className="w-full md:w-auto bg-black dark:bg-white text-white dark:text-black px-12 py-5 rounded-none text-sm font-black uppercase tracking-[0.2em] hover:invert transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-black p-6 md:p-12 rounded-none border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] dark:md:shadow-[16px_16px_0px_0px_rgba(255,255,255,1)]">
          <h3 className="text-2xl md:text-4xl font-black mb-8 md:mb-12 uppercase tracking-tight">Subscription</h3>
          <div className="p-6 md:p-10 bg-slate-100 dark:bg-slate-900 border-4 border-black dark:border-white rounded-none flex flex-col xl:flex-row xl:justify-between items-start xl:items-center gap-8 xl:gap-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8 w-full">
              <div className="size-16 md:size-20 shrink-0 bg-black dark:bg-white text-white dark:text-black rounded-none flex items-center justify-center">
                <LockKeyhole className="size-6 md:size-8" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black uppercase tracking-tight">Pro Plan</p>
                <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-1 leading-relaxed">$29/month • Renews Nov 15, 2024</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full xl:w-auto mt-2 xl:mt-0">
              <button className="w-full sm:w-auto px-8 py-4 border-4 border-black dark:border-white rounded-none text-xs font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">Manage Billing</button>
              <button className="w-full sm:w-auto px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-none text-xs font-black uppercase tracking-[0.2em] hover:invert transition-all">Upgrade Plan</button>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-black p-6 md:p-12 rounded-none border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] dark:md:shadow-[16px_16px_0px_0px_rgba(255,255,255,1)]">
          <h3 className="text-2xl md:text-4xl font-black mb-8 md:mb-12 uppercase tracking-tight">Notifications</h3>
          <div className="space-y-8 md:space-y-10">
            {[
              { title: 'Email Notifications', desc: 'Receive weekly performance reports', checked: true },
              { title: 'Push Notifications', desc: 'Alerts when episodes are published', checked: true },
              { title: 'Marketing Emails', desc: 'News about new features and tools', checked: false },
            ].map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-slate-100 dark:border-slate-900 pb-6 md:pb-8 last:border-0 last:pb-0">
                <div className="space-y-2 max-w-xs md:max-w-none">
                  <p className="text-base md:text-lg font-black uppercase tracking-tight">{item.title}</p>
                  <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
                  <div className="w-14 md:w-16 h-7 md:h-8 bg-slate-200 peer-focus:outline-none rounded-none peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-black after:border-2 after:rounded-none after:h-5 after:w-5 md:after:h-6 md:after:w-6 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white"></div>
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-none border-4 border-slate-200 dark:border-slate-800">
          <h3 className="text-lg md:text-xl font-black mb-4 uppercase tracking-tight text-slate-400">Danger Zone</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 md:mb-8 leading-relaxed">Once you delete your account, there is no going back. Please be certain.</p>
          <button className="w-full md:w-auto px-8 py-4 border-2 border-slate-300 dark:border-slate-700 text-slate-400 hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white rounded-none text-xs font-black uppercase tracking-widest transition-all">
            Delete Account
          </button>
        </section>
      </div>
    </div>
  );
}
