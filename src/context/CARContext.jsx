import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { loadData, saveData } from '../utils/storage';
import { CAR_STATUS } from '../utils/constants';
import { useAuth } from './AuthContext';
import { isSafetyTeam, canApproveCAP } from '../utils/auth';

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
  const { currentUser: authUser } = useAuth();

  // Derived role / user name — backward-compatible strings used throughout UI
  const role = authUser
    ? isSafetyTeam(authUser.roles || authUser.role) ? 'safety' : 'stakeholder'
    : null;
  // Can review CAP, approve/reject extensions, close CARs (excludes inspector-only)
  const canApprove = authUser
    ? canApproveCAP(authUser.roles || authUser.role)
    : false;
  const currentUserName = authUser?.name || '';

  // Only manage cars + nextSeq in state; never overwrite users written by AuthContext
  const [data, setData] = useState(() => {
    const d = loadData();
    return { cars: d.cars || [], nextSeq: d.nextSeq || 1 };
  });

  useEffect(() => {
    // Merge into latest localStorage data so we never clobber AuthContext's users
    const latest = loadData();
    saveData({ ...latest, cars: data.cars, nextSeq: data.nextSeq });
  }, [data]);

  // ── CAR operations ────────────────────────────────────────────────────────────
  const createCAR = useCallback((formData) => {
    const seq = data.nextSeq;
    const newCAR = {
      id: uuidv4(),
      carNumber: generateCARNumber(seq),
      status: CAR_STATUS.DRAFT,
      createdAt: new Date().toISOString(),
      createdById: authUser?.id || null,
      auditTrail: [],
      title: formData.title,
      carType: formData.carType,
      priority: formData.priority,
      findingNarrative: formData.findingNarrative,
      findingLocation: formData.findingLocation,
      incidentDate: formData.incidentDate,
      referenceNumber: formData.referenceNumber,
      // Responsible party — array (primary person for backward compat)
      responsibleUsers:        formData.responsibleUsers        || [],
      responsibleUserId:       formData.responsibleUsers?.[0]?.id || formData.responsibleUserId || null,
      responsiblePerson:       formData.responsibleUsers?.[0]?.name || formData.responsiblePerson,
      responsibleOrgType:      formData.responsibleUsers?.[0]?.orgType      || formData.responsibleOrgType      || '',
      responsibleOrgName:      formData.responsibleUsers?.[0]?.orgName      || formData.responsibleOrgName      || formData.responsibleOrganization,
      responsibleOrganization: formData.responsibleUsers?.[0]?.orgName      || formData.responsibleOrganization || '',
      responsibleDepartment:   formData.responsibleUsers?.[0]?.department   || formData.responsibleDepartment   || '',
      responsiblePosition:     formData.responsibleUsers?.[0]?.position     || formData.responsiblePosition     || '',
      responsibleEmail:        formData.responsibleUsers?.[0]?.email        || formData.responsibleEmail,
      responsibleContactNumber:formData.responsibleUsers?.[0]?.contactNumber|| formData.responsibleContactNumber|| '',
      issuedBy: currentUserName,
      dueDate: formData.dueDate,
      findingAttachments: formData.findingAttachments || [],
      // RCA/CAP (filled by stakeholder)
      rootCauseAnalysis: '',
      correctiveActionPlan: '',
      capTargetDate: '',
      capAttachments: [],
      rcaSubmittedAt: null,
      rcaSubmittedBy: '',
      // Review
      reviewComments: '',
      reviewedBy: '',
      reviewedAt: null,
      // Final action
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
    const withAudit = addAuditEntry(newCAR, 'CAR Created', currentUserName, `CAR ${newCAR.carNumber} created`);
    setData((prev) => ({
      cars: [withAudit, ...prev.cars],
      nextSeq: prev.nextSeq + 1,
    }));
    return withAudit;
  }, [data.nextSeq, authUser, currentUserName]);

  const issueCAR = useCallback((carId) => {
    setData((prev) => ({
      ...prev,
      cars: prev.cars.map((c) => {
        if (c.id !== carId) return c;
        const updated = { ...c, status: CAR_STATUS.ISSUED, issuedAt: new Date().toISOString(), issuedBy: currentUserName };
        return addAuditEntry(updated, 'CAR Issued', currentUserName, 'CAR issued to responsible person');
      }),
    }));
  }, [currentUserName]);

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
          ...c, status,
          reviewComments: comments,
          reviewedBy: currentUserName,
          reviewedAt: new Date().toISOString(),
        };
        return addAuditEntry(updated, action, currentUserName, comments);
      }),
    }));
  }, [currentUserName]);

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
          closedBy: currentUserName,
          closedAt: new Date().toISOString(),
        };
        return addAuditEntry(updated, 'CAR Closed', currentUserName, comments || 'CAR accepted and closed');
      }),
    }));
  }, [currentUserName]);

  const updateCAR = useCallback((carId, formData) => {
    setData((prev) => ({
      ...prev,
      cars: prev.cars.map((c) => {
        if (c.id !== carId) return c;
        const updated = {
          ...c,
          title:              formData.title,
          carType:            formData.carType,
          priority:           formData.priority,
          findingNarrative:   formData.findingNarrative,
          findingLocation:    formData.findingLocation,
          incidentDate:       formData.incidentDate,
          referenceNumber:    formData.referenceNumber,
          dueDate:            formData.dueDate,
          findingAttachments: formData.findingAttachments || [],
          // Responsible party — array + backward-compat single fields
          responsibleUsers:        formData.responsibleUsers        || [],
          responsibleUserId:       formData.responsibleUsers?.[0]?.id || formData.responsibleUserId || null,
          responsiblePerson:       formData.responsibleUsers?.[0]?.name || formData.responsiblePerson,
          responsibleOrgType:      formData.responsibleUsers?.[0]?.orgType      || formData.responsibleOrgType      || '',
          responsibleOrgName:      formData.responsibleUsers?.[0]?.orgName      || formData.responsibleOrgName      || '',
          responsibleOrganization: formData.responsibleUsers?.[0]?.orgName      || formData.responsibleOrganization || '',
          responsibleDepartment:   formData.responsibleUsers?.[0]?.department   || formData.responsibleDepartment   || '',
          responsiblePosition:     formData.responsibleUsers?.[0]?.position     || formData.responsiblePosition     || '',
          responsibleEmail:        formData.responsibleUsers?.[0]?.email        || formData.responsibleEmail,
          responsibleContactNumber:formData.responsibleUsers?.[0]?.contactNumber|| formData.responsibleContactNumber|| '',
        };
        return addAuditEntry(updated, 'CAR Updated', currentUserName, `Updated by ${currentUserName}`);
      }),
    }));
  }, [currentUserName]);

  // ── Extension request ─────────────────────────────────────────────────────────
  const requestExtension = useCallback((carId, { reason, proposedDate }) => {
    setData((prev) => ({
      ...prev,
      cars: prev.cars.map((c) => {
        if (c.id !== carId) return c;
        const req = {
          id: uuidv4(),
          requestedAt: new Date().toISOString(),
          requestedBy: currentUserName,
          reason,
          proposedDate,
          status: 'pending',
          reviewedAt: null,
          reviewedBy: '',
          reviewComments: '',
        };
        const updated = { ...c, extensionRequests: [...(c.extensionRequests || []), req] };
        return addAuditEntry(updated, 'Extension Requested', currentUserName,
          `Requested extension to ${proposedDate} — ${reason}`);
      }),
    }));
  }, [currentUserName]);

  const reviewExtension = useCallback((carId, requestId, approved, reviewComments) => {
    setData((prev) => ({
      ...prev,
      cars: prev.cars.map((c) => {
        if (c.id !== carId) return c;
        const updatedRequests = (c.extensionRequests || []).map((r) =>
          r.id !== requestId ? r : {
            ...r,
            status: approved ? 'approved' : 'rejected',
            reviewedAt: new Date().toISOString(),
            reviewedBy: currentUserName,
            reviewComments,
          },
        );
        const approvedReq = updatedRequests.find((r) => r.id === requestId && r.status === 'approved');
        const updated = {
          ...c,
          extensionRequests: updatedRequests,
          dueDate: approvedReq ? approvedReq.proposedDate : c.dueDate,
        };
        const action = approved ? 'Extension Approved' : 'Extension Rejected';
        return addAuditEntry(updated, action, currentUserName,
          reviewComments || (approved ? `Due date extended to ${approvedReq?.proposedDate}` : 'Extension rejected'));
      }),
    }));
  }, [currentUserName]);

  const deleteCAR = useCallback((carId) => {
    setData((prev) => ({ ...prev, cars: prev.cars.filter((c) => c.id !== carId) }));
  }, []);

  return (
    <CARContext.Provider value={{
      cars: data.cars,
      role,
      canApprove,
      currentUser: currentUserName,  // keep as string for backward compat
      createCAR,
      updateCAR,
      issueCAR,
      submitRCA,
      reviewCAP,
      submitFinalAction,
      closeCAR,
      requestExtension,
      reviewExtension,
      deleteCAR,
    }}>
      {children}
    </CARContext.Provider>
  );
}
