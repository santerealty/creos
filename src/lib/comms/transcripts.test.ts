import { describe, it, expect } from 'vitest';
import { 
  TRANSCRIPTS, 
  getTranscriptForApproval,
  getAllTranscripts 
} from './transcripts';

describe('Transcripts', () => {
  describe('Transcript library', () => {
    it('should have all required transcripts', () => {
      expect(TRANSCRIPTS.UNDERWRITING_LEVERAGE_DEBATE).toBeDefined();
      expect(TRANSCRIPTS.ENVIRONMENTAL_EXCEPTION_DEBATE).toBeDefined();
      expect(TRANSCRIPTS.LOAN_TERMS_NEGOTIATION).toBeDefined();
      expect(TRANSCRIPTS.HOLD_SELL_TIMING).toBeDefined();
      expect(TRANSCRIPTS.TAX_STRATEGY_EXIT).toBeDefined();
    });

    it('should have complete transcript data', () => {
      Object.values(TRANSCRIPTS).forEach(transcript => {
        expect(transcript.id).toBeTruthy();
        expect(transcript.title).toBeTruthy();
        expect(transcript.approvalType).toBeTruthy();
        expect(transcript.turns.length).toBeGreaterThan(0);
        expect(transcript.summary).toBeTruthy();
      });
    });

    it('should have valid persona IDs in turns', () => {
      Object.values(TRANSCRIPTS).forEach(transcript => {
        transcript.turns.forEach(turn => {
          expect(turn.personaId).toBeTruthy();
          expect(turn.message).toBeTruthy();
        });
      });
    });

    it('should have multi-turn conversations (2+ turns)', () => {
      Object.values(TRANSCRIPTS).forEach(transcript => {
        expect(transcript.turns.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('getTranscriptForApproval', () => {
    it('should return transcript for UNDERWRITING_OPINION', () => {
      const transcript = getTranscriptForApproval('UNDERWRITING_OPINION', 'UNDERWRITING');
      expect(transcript).toBeDefined();
      expect(transcript?.id).toBe('underwriting-leverage-debate');
    });

    it('should return transcript for ENVIRONMENTAL_EXCEPTION', () => {
      const transcript = getTranscriptForApproval('ENVIRONMENTAL_EXCEPTION', 'DUE_DILIGENCE');
      expect(transcript).toBeDefined();
      expect(transcript?.id).toBe('environmental-exception-debate');
    });

    it('should return transcript for LOAN_TERMS', () => {
      const transcript = getTranscriptForApproval('LOAN_TERMS', 'FINANCING');
      expect(transcript).toBeDefined();
      expect(transcript?.id).toBe('loan-terms-negotiation');
    });

    it('should return transcript for HOLD_SELL_DECISION', () => {
      const transcript = getTranscriptForApproval('HOLD_SELL_DECISION', 'HOLD_DECISION');
      expect(transcript).toBeDefined();
      expect(transcript?.id).toBe('hold-sell-timing');
    });

    it('should return transcript for TAX_STRATEGY', () => {
      const transcript = getTranscriptForApproval('TAX_STRATEGY', 'TAX_CLOSEOUT');
      expect(transcript).toBeDefined();
      expect(transcript?.id).toBe('tax-strategy-exit');
    });

    it('should return null for approval types without transcripts', () => {
      const transcript = getTranscriptForApproval('DATA_VALIDATION', 'DATA_REVIEW');
      expect(transcript).toBeNull();
    });
  });

  describe('getAllTranscripts', () => {
    it('should return all transcripts', () => {
      const transcripts = getAllTranscripts();
      expect(transcripts.length).toBe(5);
    });

    it('should return valid transcript objects', () => {
      const transcripts = getAllTranscripts();
      transcripts.forEach(t => {
        expect(t.id).toBeTruthy();
        expect(t.title).toBeTruthy();
      });
    });
  });

  describe('Transcript content quality', () => {
    it('should show disagreement/discussion in turns', () => {
      const debate = TRANSCRIPTS.UNDERWRITING_LEVERAGE_DEBATE;
      const hasMultiplePersonas = new Set(debate.turns.map(t => t.personaId)).size > 1;
      expect(hasMultiplePersonas).toBe(true);
    });

    it('should include relevant technical details', () => {
      const loan = TRANSCRIPTS.LOAN_TERMS_NEGOTIATION;
      const hasRateInfo = loan.turns.some(t => t.message.includes('5.') || t.message.includes('%'));
      expect(hasRateInfo).toBe(true);
    });

    it('should have meaningful final turns', () => {
      Object.values(TRANSCRIPTS).forEach(transcript => {
        const lastTurn = transcript.turns[transcript.turns.length - 1];
        // Last turn should have substantial content
        expect(lastTurn.message.length).toBeGreaterThan(50);
      });
    });
  });
});
