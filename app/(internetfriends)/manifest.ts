import content from "@/app/(internetfriends)/content.json";
import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: content.companyName,
    short_name: content.companyNameShort,
    description: content.hero.description,
    _start_url: '/',
    _display: 'standalone',
    _background_color: '#FF7E29',
    _theme_color: '#FF486C',
    icons: [
      {
        src: '/icon/192',
        sizes: '192x192',
        type: 'image/png',
        _purpose: 'any',
      },
      {
        src: '/icon/384',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: '/icon/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    _orientation: 'portrait',
    _categories: ['business', 'productivity', 'marketing'],
    _shortcuts: [
      {
        name: 'Contact Us',
        short_name: 'Contact',
        description: 'Get in touch with our team',
        url: '/contact',
        icons: [{ src: '/icon/96', sizes: '96x96' }],
      },
      {
        name: 'Enterprise Solutions',
        short_name: 'Pricing',
        description: 'Learn about our pricing',
        url: '/pricing',
        icons: [{ src: '/icon/96.png', sizes: '96x96' }],
      },
    ],
    // _screenshots: [
    //   {
    //     src: '/screenshot1.png',
    //     sizes: '1170x2532',
    //     type: 'image/png',
    //     label: 'Homepage of Hire Digital',
    //   },
    //   {
    //     src: '/screenshot2.png',
    //     sizes: '1170x2532',
    //     type: 'image/png',
    //     label: 'Enterprise Solutions page',
    //   },
    // ],
    _prefer_related_applications: false,
    // _related_applications: [
    //   {
    //     platform: 'play',
    //     url: 'https://play.google.com/store/apps/details?id=com.hiredigital.app',
    //     id: 'com.hiredigital.app',
    //   },
    //   {
    //     platform: 'itunes',
    //     url: 'https://apps.apple.com/app/hiredigital/id123456789',
    //   },
    // ],
    // _share_target: {
    //   _action: '/share-target',
    //   _method: 'POST',
    //   _enctype: 'multipart/form-data',
    //   _params: {
    //     title: 'title',
    //     text: 'text',
    //     url: 'url',
    //     _files: [
    //       {
    //         name: 'media',
    //         _accept: ['image/*', 'video/*'],
    //       },
    //     ],
    //   },
    // },
  }
}

