
'use client';

import type { Player } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { User, Mail, Phone, Building, Star } from 'lucide-react';
import { formatScore } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {getInitials(player.name, player.surname)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{player.name} {player.surname}</DialogTitle>
              <DialogDescription>Player Details</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">{player.name} {player.surname}</span>
          </div>
          {player.company && (
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{player.company}</span>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">{player.email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">{player.phone}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Star className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-semibold">Score: {formatScore(player.score)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    