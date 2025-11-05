
'use client';

import type { Player } from '@/lib/types';
import { User, Mail, Phone, Building, Star } from 'lucide-react';
import { formatScore } from '@/lib/utils';
import type { Player } from '@/lib/types';

interface PlayerDetailsModalProps {
  player: Player | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function PlayerDetailsModal({ player, isOpen, onOpenChange }: PlayerDetailsModalProps) {
  if (!player) {
    return null;
  }

  const getInitials = (name: string, surname: string) => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <div className="flex items-center space-x-4">
          <div className="avatar placeholder">
            <div className="bg-neutral-focus text-neutral-content rounded-full w-16">
              <span className="text-2xl">{getInitials(player.name, player.surname)}</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-2xl">{player.name} {player.surname}</h3>
            <p className="text-sm">Player Details</p>
          </div>
        </div>
        <div className="py-4 space-y-2">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5" />
            <span>{player.name} {player.surname}</span>
          </div>
          {player.company && (
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5" />
              <span>{player.company}</span>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5" />
            <span>{player.email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5" />
            <span>{player.phone}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Star className="h-5 w-5" />
            <span className="font-semibold">Score: {formatScore(player.score)}</span>
          </div>
        </div>
        <div className="modal-action">
          <button className="btn" onClick={() => onOpenChange(false)}>Close</button>
        </div>
      </div>
    </div>
  );
}

    