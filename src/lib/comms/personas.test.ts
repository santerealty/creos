import { describe, it, expect } from 'vitest';
import { 
  PERSONAS, 
  getPersonaForApproval, 
  getPersonaById,
  getAllPersonas,
} from './personas';

describe('Agent Personas', () => {
  describe('Persona definitions', () => {
    it('should have all required personas', () => {
      expect(PERSONAS.ACQUISITIONS_ANALYST).toBeDefined();
      expect(PERSONAS.UNDERWRITER).toBeDefined();
      expect(PERSONAS.DEBT_BROKER).toBeDefined();
      expect(PERSONAS.DUE_DILIGENCE_LEAD).toBeDefined();
      expect(PERSONAS.ASSET_MANAGER).toBeDefined();
      expect(PERSONAS.TAX_ADVISOR).toBeDefined();
      expect(PERSONAS.ORCHESTRATOR).toBeDefined();
    });

    it('should have complete persona data', () => {
      Object.values(PERSONAS).forEach(persona => {
        expect(persona.id).toBeTruthy();
        expect(persona.name).toBeTruthy();
        expect(persona.role).toBeTruthy();
        expect(persona.bio).toBeTruthy();
        expect(persona.initials).toBeTruthy();
        expect(persona.avatarColor).toBeTruthy();
        expect(persona.voiceTone).toBeTruthy();
      });
    });
  });

  describe('getPersonaForApproval', () => {
    it('should map DATA_VALIDATION to Acquisitions Analyst', () => {
      const persona = getPersonaForApproval('DATA_VALIDATION', 'DATA_REVIEW');
      expect(persona.id).toBe('acq_analyst');
    });

    it('should map UNDERWRITING_OPINION to Underwriter', () => {
      const persona = getPersonaForApproval('UNDERWRITING_OPINION', 'UNDERWRITING');
      expect(persona.id).toBe('underwriter');
    });

    it('should map LOAN_TERMS to Debt Broker', () => {
      const persona = getPersonaForApproval('LOAN_TERMS', 'FINANCING');
      expect(persona.id).toBe('debt_broker');
    });

    it('should map OPERATIONAL_DECISION to Asset Manager', () => {
      const persona = getPersonaForApproval('OPERATIONAL_DECISION', 'OPERATIONS');
      expect(persona.id).toBe('asset_mgr');
    });

    it('should map TAX_STRATEGY to Tax Advisor', () => {
      const persona = getPersonaForApproval('TAX_STRATEGY', 'TAX_CLOSEOUT');
      expect(persona.id).toBe('tax_advisor');
    });

    it('should default to Orchestrator for unmapped types', () => {
      const persona = getPersonaForApproval('IC_DECISION', 'IC_APPROVAL');
      expect(persona.id).toBe('orchestrator');
    });
  });

  describe('getPersonaById', () => {
    it('should retrieve persona by id', () => {
      const persona = getPersonaById('underwriter');
      expect(persona?.name).toBe('Sarah Chen');
    });

    it('should return undefined for invalid id', () => {
      const persona = getPersonaById('invalid_id');
      expect(persona).toBeUndefined();
    });
  });

  describe('getAllPersonas', () => {
    it('should return all personas', () => {
      const personas = getAllPersonas();
      expect(personas.length).toBe(7);
    });
  });
});
