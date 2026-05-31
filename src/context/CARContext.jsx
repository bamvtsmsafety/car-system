import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { loadData, saveData } from '../utils/storage';
import { CAR_STATUS } from '../utils/constants';

const CARContext = createContext(null);

export const useCARContext = () => {
  const ctx = useContext(CARContext);
  if (!ctx) throw new Error('useCARContext must be used within CARProvider');
  return ctx;
};

const generateCARNumber = (seq) => {
  const year = new Date().getFullYear();
  return `CAR-${year}-${String(seq).padStart(4, '0')}`;
};

const addAuditEntry = (car, action, actor, notes = '') => ({
  ...car,
  auditTrail: [
    ...(car.auditTrail || []),
    { id: uuidv4(), action, actor, notes, timestamp: new Date().toISOString() },
  ],
});

export function CARProvider({ children }) {
  const [data, setData] = useState(() => loadData());
  const [role, setRole] = useState('safety'); // 'safety' | 'stakeholder'
  const [currentUser, setCurrentUser] = useState('Safety Officer');

  useEffect(() => {
    saveData(data);
  }, [data]);

  const createCAR = useCallback((formData) => {
    const seq = data.nextSeq;
    const newCAR = {
      id: uuidv4(),
      carNumber: generateCARNumber(seq),
      status: CAR_STATUS.DRAFT,
      createdAt: new Date().toISOString(),
      auditTrail: [],
      // Finding details
      title: formData.title,
      carType: formData.carType,
      priority: formData.priority,
      findingNarrative: formData.findingNarrative,
      findingLocation: formData.findingLocation,
      incidentDate: formData.incidentDate,
      referenceNumber: formData.referenceNumber,
      // Responsible party
      responsiblePerson: formData.responsiblePerson,
      responsibleOrganization: formData.responsibleOrganization,
      responsibleEmail: formData.responsibleEmail,
      issuedBy: currentUser,
      dueDate: formData.dueDate,
      // Attachments (base64)
      findingAttachments: formData.findingAttachments || [],
      // RCA/CAP fields (filled by stakeholder)
      rootCauseAnalysis: '',
      correctiveActionPlan: '',
      capTargetDate: '',
      capAttachments: [],
      rcaSubmittedAt: null,
      rcaSubmittedBy: '',
      // Review fields
      reviewComments: '',
      reviewedBy: '',
      reviewedAt: null,
      // Final action fields
      finalActionTaken: '',
      finalActionDate: '',
      finalActionAttachments: [],
      finalActionSubmittedAt: null,
      finalActionSubmittedBy: '',
      // Closure
      closureComments: '',
      closedBy: '',
      closedAt: null,
    };
    const withAudit = addAuditEntry(newCAR, 'CAR Created', currentUser, `CAR ${newCAR.carNumber} created`);
    setData((prev) => ({
      cars: [withAudit, ...prev.cars],
      nextSeq: prev.nextSeq + 1,
    }));
    return withAudit;
  }, [data.nextSeq, currentUser]);

  const issueCAR = useCallback((carId) => {
    setData((prev) => ({
      ...prev,
      cars: prev.cars.map((c) => {
        if (c.id !== carId) return c;
        const updated = { ...c, status: CAR_STATUS.ISSUED, issuedAt: new Date().toISOString() };
        return addAuditEntry(updated, 'CAR Issued', currentUser, 'CAR issued to responsible person');
      }),
    }));
  }, [currentUser]);

  const submitRCA = useCallback((carId, formData) => {
    setData((prev) => ({
      ...prev,
      cars: prev.cars.map((c) => {
        if (c.id !== carId) return c;
        const updated = {
          ...c,
          status: CAR_STATUS.RCA_SUBMITTED,
          rootCauseAnalysis: formData.rootCauseAnalysis,
          correctiveActionPlan: formData.correctiveActionPlan,
          capTargetDate: formData.capTargetDate,
          capAttachments: formData.capAttachments || [],
          rcaSubmittedAt: new Date().toISOString(),
          rcaSubmittedBy: formData.submittedBy,
        };
        return addAuditEntry(updated, 'RCA/CAP Submitted', formData.submittedBy, 'Root Cause Analysis and Corrective Action Plan submitted');
      }),
    }));
  }, []);

  const reviewCAP = useCallback((carId, approved, comments) => {
    setData((prev) => ({
      ...prev,
      cars: prev.cars.map((c) => {
        if (c.id !== carId) return c;
        const status = approved ? CAR_STATUS.RCA_APPROVED : CAR_STATUS.RCA_REJECTED;
        const action = approved ? 'CAP Approved' : 'CAP Rejected';
        const updated = {
          ...c,
          status,
          reviewComments: comments,
          reviewedBy: currentUser,
          reviewedAt: new Date().toISOString(),
        };
        return addAuditEntry(updated, action, currentUser, comments);
      }),
    }));
  }, [currentUser]);

  const submitFinalAction = useCallback((carId, formData) => {
    setData((prev) => ({
      ...prev,
      cars: prev.cars.map((c) => {
        if (c.id !== carId) return c;
        const updated = {
          ...c,
          status: CAR_STATUS.ACTION_SUBMITTED,
          finalActionTaken: formData.finalActionTaken,
          finalActionDate: formData.finalActionDate,
          finalActionAttachments: formData.finalActionAttachments || [],
          finalActionSubmittedAt: new Date().toISOString(),
          finalActionSubmittedBy: formData.submittedBy,
        };
        return addAuditEntry(updated, 'Final Action Submitted', formData.submittedBy, 'Final action taken with evidence submitted');
      }),
    }));
  }, []);

  const closeCAR = useCallback((carId, comments) => {
    setData((prev) => ({
      ...prev,
      cars: prev.cars.map((c) => {
        if (c.id !== carId) return c;
        const updated = {
          ...c,
          status: CAR_STATUS.CLOSED,
          closureComments: comments,
          closedBy: currentUser,
          closedAt: new Date().toISOString(),
        };
        return addAuditEntry(updated, 'CAR Closed', currentUser, comments || 'CAR accepted and closed');
      }),
    }));
  }, [currentUser]);

  const deleteCAR = useCallback((carId) => {
    setData((prev) => ({
      ...prev,
      cars: prev.cars.filter((c) => c.id !== carId),
    }));
  }, []);

  return (
    <CARContext.Provider value={{
      cars: data.cars,
      role,
      setRole,
      currentUser,
      setCurrentUser,
      createCAR,
      issueCAR,
      submitRCA,
      reviewCAP,
      submitFinalAction,
      closeCAR,
      deleteCAR,
    }}>
      {children}
    </CARContext.Provider>
  );
}
