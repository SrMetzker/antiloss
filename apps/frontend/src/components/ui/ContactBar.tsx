import React from 'react'
import { Mail, MessageCircle } from 'lucide-react'

interface ContactBarProps {
  email?: string
  whatsapp?: string
  whatsappMessage?: string
}

export const ContactBar: React.FC<ContactBarProps> = ({
  email = 'suporte@stratto.com',
  whatsapp,
  whatsappMessage = 'Olá! Preciso de ajuda com o Stratto.',
}) => {
  const whatsappNumber = whatsapp?.replace(/\D/g, '')
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : undefined

  return (
    <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
      <a
        href={`mailto:${email}`}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        <Mail className="w-3.5 h-3.5" />
        <span>Email</span>
      </a>

      {whatsappUrl && (
        <>
          <span className="text-gray-700 text-xs">·</span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </>
      )}
    </div>
  )
}
