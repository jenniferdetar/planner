import { useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import './AbsenceForms.css'

// ─── Generic field primitives ─────────────────────────────────────────────────

function Cell({ label, children, grow }) {
  return (
    <div className={`afm-cell ${grow ? 'grow' : ''}`}>
      <span className="afm-cell-label">{label}</span>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      className="afm-input"
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}

function DateTriplet({ value, onChange }) {
  return (
    <div className="afm-date-triplet">
      <input className="afm-date-part" type="text" inputMode="numeric" maxLength={2} placeholder="Mo"
        value={value.mo} onChange={e => onChange({ ...value, mo: e.target.value })} />
      <span>/</span>
      <input className="afm-date-part" type="text" inputMode="numeric" maxLength={2} placeholder="Day"
        value={value.day} onChange={e => onChange({ ...value, day: e.target.value })} />
      <span>/</span>
      <input className="afm-date-part w" type="text" inputMode="numeric" maxLength={4} placeholder="Yr"
        value={value.yr} onChange={e => onChange({ ...value, yr: e.target.value })} />
    </div>
  )
}

function Check({ checked, onToggle, label }) {
  return (
    <span className="afm-check" onClick={onToggle}>
      <span className={`afm-box ${checked ? 'checked' : ''}`}>{checked ? '✓' : ''}</span>
      <span className="afm-check-label">{label}</span>
    </span>
  )
}

function YesNo({ value, onChange }) {
  return (
    <span className="afm-yesno">
      <Check checked={value === 'yes'} onToggle={() => onChange(value === 'yes' ? '' : 'yes')} label="Yes" />
      <Check checked={value === 'no'} onToggle={() => onChange(value === 'no' ? '' : 'no')} label="No" />
    </span>
  )
}

function PaidUnpaid({ value, onChange }) {
  return (
    <span className="afm-yesno">
      <Check checked={value === 'paid'} onToggle={() => onChange(value === 'paid' ? '' : 'paid')} label="Paid" />
      <Check checked={value === 'unpaid'} onToggle={() => onChange(value === 'unpaid' ? '' : 'unpaid')} label="Unpaid" />
    </span>
  )
}

const blankDate = { mo: '', day: '', yr: '' }

// ─── Shared header (identical between both LAUSD forms) ──────────────────────

function FormHeader({ formNo, sideLabel, title, showSubTemp, data, set }) {
  return (
    <>
      <div className="afm-titlebar">
        <div className="afm-district">Los Angeles Unified School District</div>
        <div className="afm-title">{title}</div>
      </div>

      <div className="afm-section-label">Employee Information (Please Print)</div>
      <div className="afm-grid afm-employee-grid">
        <Cell label="Last Name"><TextInput value={data.lastName} onChange={v => set('lastName', v)} /></Cell>
        <Cell label="First Name"><TextInput value={data.firstName} onChange={v => set('firstName', v)} /></Cell>
        <Cell label="M.I."><TextInput value={data.mi} onChange={v => set('mi', v)} /></Cell>
        <Cell label="Employee No."><TextInput value={data.employeeNo} onChange={v => set('employeeNo', v)} /></Cell>

        <Cell label="Work Location Name" grow><TextInput value={data.workLocation} onChange={v => set('workLocation', v)} /></Cell>
        <Cell label="Job Title"><TextInput value={data.jobTitle} onChange={v => set('jobTitle', v)} /></Cell>
        {showSubTemp && (
          <Cell label="Substitute/Temporary">
            <YesNo value={data.subTemp} onChange={v => set('subTemp', v)} />
          </Cell>
        )}
        <Cell label="Employee's Telephone">
          <TextInput value={data.phone} onChange={v => set('phone', v)} placeholder="(   )" />
        </Cell>
      </div>

      <div className="afm-section-label">Reason for Absence</div>
      <div className="afm-reason-dates">
        <div className="afm-reason-line">
          <span className="afm-q-num">1.</span>
          <span>Starting date of absence</span>
          <DateTriplet value={data.startDate} onChange={v => set('startDate', v)} />
          <span>Last date of absence (expected)</span>
          <DateTriplet value={data.lastDate} onChange={v => set('lastDate', v)} />
        </div>
        <div className="afm-reason-line">
          <span className="afm-q-num">2.</span>
          <span>Total time (expected) of absence:</span>
          <input className="afm-input short" type="text" value={data.totalDays} onChange={e => set('totalDays', e.target.value)} />
          <span>days;</span>
          <input className="afm-input short" type="text" value={data.totalHours} onChange={e => set('totalHours', e.target.value)} />
          <span>hours.</span>
          <span className="afm-yesno">
            <Check checked={data.ampm === 'AM'} onToggle={() => set('ampm', data.ampm === 'AM' ? '' : 'AM')} label="AM" />
            <Check checked={data.ampm === 'PM'} onToggle={() => set('ampm', data.ampm === 'PM' ? '' : 'PM')} label="PM" />
          </span>
        </div>
        <p className="afm-note">
          NOTE: This form does not supersede or replace the Leave of Absence Request Form (PC Form 5006 or HR Form 1065), when required.
        </p>
      </div>
    </>
  )
}

// ─── Shared certification / signature / approval blocks ──────────────────────

function CertificationStatement() {
  return (
    <p className="afm-cert-text">
      I certify I was/will not be employed elsewhere during my regular work hours within the time period claimed on this
      certification, unless taking vacation. I certify my absence during this period was not and is not for participating in a
      strike/work stoppage or because of my unwillingness to cross picket lines and I would have been available for duty if it
      had not been for the reason cited above. Furthermore, I certify my absence during my hours of assigned duty is because of
      the above listed reason in accordance with any applicable Board/PC rule or Collective Bargaining Agreement. I also agree
      and authorize that once the correct benefit usage charged above is processed, any unearned wages paid as a result will be
      collected from the next paycheck. I declare under the penalty of perjury that the foregoing is true and correct.
    </p>
  )
}

function SignatureBlock({ data, set }) {
  return (
    <div className="afm-sig-row">
      <div className="afm-sig-field grow">
        <span className="afm-cell-label">Employee's Signature</span>
        <TextInput value={data.employeeSig} onChange={v => set('employeeSig', v)} />
      </div>
      <div className="afm-sig-field">
        <span className="afm-cell-label">Date</span>
        <TextInput value={data.employeeDate} onChange={v => set('employeeDate', v)} />
      </div>
    </div>
  )
}

function ApprovalBlock({ data, set }) {
  return (
    <>
      <div className="afm-approval-row">
        <span>For Administrator/Supervisor: Do you approve the requested absence?</span>
        <YesNo value={data.approved} onChange={v => set('approved', v)} />
      </div>
      <div className="afm-sig-row">
        <div className="afm-sig-field grow">
          <span className="afm-cell-label">Explanation (If No)</span>
          <TextInput value={data.explanation} onChange={v => set('explanation', v)} />
        </div>
      </div>
    </>
  )
}

function AdminAckRow({ data, set }) {
  return (
    <div className="afm-sig-row">
      <div className="afm-sig-field grow">
        <span className="afm-cell-label">Print Name</span>
        <TextInput value={data.adminName} onChange={v => set('adminName', v)} />
      </div>
      <div className="afm-sig-field grow">
        <span className="afm-cell-label">Signature</span>
        <TextInput value={data.adminSig} onChange={v => set('adminSig', v)} />
      </div>
      <div className="afm-sig-field">
        <span className="afm-cell-label">Date</span>
        <TextInput value={data.adminDate} onChange={v => set('adminDate', v)} />
      </div>
    </div>
  )
}

// ─── Illness form ──────────────────────────────────────────────────────────────

const blankIllness = {
  lastName: '', firstName: '', mi: '', employeeNo: '',
  workLocation: '', jobTitle: '', subTemp: '', phone: '',
  startDate: { ...blankDate }, lastDate: { ...blankDate },
  totalDays: '', totalHours: '', ampm: '',
  typeA: false, typeB: false, typeC: false, typeD: false, typeE: false,
  cPay: '', dPay: '',
  eRelation: '', ePersonalNecessity: false, eKinCare: false,
  q4: '', q5: '', q6: '',
  employeeSig: '', employeeDate: '',
  fmlaOnFile: '',
  adminName: '', adminSig: '', adminDate: '',
  approved: '', explanation: '',
}

function IllnessForm({ data, setData }) {
  const set = (k, v) => setData(d => ({ ...d, [k]: v }))

  return (
    <div className="afm-page">
      <div className="afm-side-label">{'ILLNESS'.split('').map((c, i) => <span key={i}>{c}</span>)}</div>
      <div className="afm-form-no">Form No. 60.ILL; 01/31/24</div>

      <FormHeader
        title="Certification/Request of Absence for Illness, Family Illness, New Child"
        showSubTemp
        data={data}
        set={set}
      />

      <div className="afm-reason-line" style={{ marginTop: 6 }}>
        <span className="afm-q-num">3.</span>
        <span>Select appropriate type of leave:</span>
      </div>
      <p className="afm-note">
        The following types of absence may qualify for protection under the Family and Medical Leave Act ("FMLA") and/or the
        California Family Rights Act ("CFRA"). You may request protection if the absence is covered under the qualifying
        conditions. LAUSD may also, on its own, designate an absence/leave as FMLA/CFRA, if the absence meets legal requirements.
      </p>

      <div className="afm-type-list">
        <Check checked={data.typeA} onToggle={() => set('typeA', !data.typeA)} label="A) My Personal Illness/Injury/Disability/Medical Appointment/Accident" />
        <Check checked={data.typeB} onToggle={() => set('typeB', !data.typeB)} label="B) My Occupational Illness/Injury or Act of Violence" />
        <div className="afm-type-with-extra">
          <Check checked={data.typeC} onToggle={() => set('typeC', !data.typeC)} label="C) My Pregnancy-related Illness/Disability" />
          <PaidUnpaid value={data.cPay} onChange={v => set('cPay', v)} />
        </div>
        <div className="afm-type-with-extra">
          <Check checked={data.typeD} onToggle={() => set('typeD', !data.typeD)} label="D) Parental Leave (Birth of a child/Newly adopted/New foster care)" />
          <PaidUnpaid value={data.dPay} onChange={v => set('dPay', v)} />
        </div>
        <div className="afm-type-with-extra">
          <Check checked={data.typeE} onToggle={() => set('typeE', !data.typeE)} label="E) Illness/Injury/Disability/Accident–My Family Member (relation" />
          <TextInput value={data.eRelation} onChange={v => set('eRelation', v)} />
          <span>)</span>
        </div>
        <div className="afm-sub-checks">
          <Check checked={data.ePersonalNecessity} onToggle={() => set('ePersonalNecessity', !data.ePersonalNecessity)} label="Personal Necessity" />
          <Check checked={data.eKinCare} onToggle={() => set('eKinCare', !data.eKinCare)} label="Kin-Care" />
        </div>
      </div>
      <p className="afm-note">
        NOTE: Absences "A" through "D" may qualify as Illness leave; "D", and "E" as Personal Necessity; "E" may also be Kin-Care.
      </p>

      <div className="afm-section-label">FMLA/CFRA Information</div>
      <div className="afm-approval-row">
        <span>4. Is the absence due to a "serious health condition" (see separate FMLA form for Definitions)?</span>
        <YesNo value={data.q4} onChange={v => set('q4', v)} />
      </div>
      <p className="afm-note">Note: To confirm serious health condition, you are required to return "FMLA Certification of Health Provider" within 15 calendar days</p>
      <div className="afm-approval-row">
        <span>5. Do you request FMLA/CFRA protections for serious health condition or other qualifying reason? (See District website or your supervisor for FMLA facts)</span>
        <YesNo value={data.q5} onChange={v => set('q5', v)} />
      </div>

      <div className="afm-section-label">Important LAUSD Information</div>
      <p className="afm-note callout">
        'Physician Statement' is required if absence is over 5 consecutive days or if required by Administrator under LAUSD
        Rules. 'FMLA Certification of Health Care Provider' is required if FMLA/CFRA protections are being requested for
        serious health condition. Birth certificate or legal documentation is required for birth of a child/newly adopted/new
        foster care.
      </p>
      <div className="afm-approval-row">
        <span>6. Is the appropriate documentation submitted with this request?</span>
        <YesNo value={data.q6} onChange={v => set('q6', v)} />
      </div>
      <p className="afm-note">NOTE: If the answer is "No", the correct documentation must be submitted separately and promptly.</p>

      <CertificationStatement />
      <SignatureBlock data={data} set={set} />

      <div className="afm-approval-row">
        <span>For Administrator/Supervisor: Is the FMLA supporting documentation received/on file?</span>
        <YesNo value={data.fmlaOnFile} onChange={v => set('fmlaOnFile', v)} />
      </div>
      <div className="afm-section-label small">Administrator/Supervisor's Acknowledgment/Approval</div>
      <AdminAckRow data={data} set={set} />
      <ApprovalBlock data={data} set={set} />

      <div className="afm-form-no footer">Form No. 60.ILL; 01/31/24</div>
    </div>
  )
}

// ─── Non-Illness form ──────────────────────────────────────────────────────────

const blankNonIllness = {
  lastName: '', firstName: '', mi: '', employeeNo: '',
  workLocation: '', jobTitle: '', phone: '',
  startDate: { ...blankDate }, lastDate: { ...blankDate },
  totalDays: '', totalHours: '', ampm: '',
  typeA: false, explainA: '',
  typeB: false, explainB: '',
  typeC: false, explainC: '',
  typeD: false, explainD: '',
  typeE: false, ePay: '',
  typeF: false, fPay: '',
  typeG: false, gPay: '', gVerify: '',
  typeH: false, hRelation: '',
  typeI: false, iVerify: '',
  typeJ: false,
  typeK: false, kAccrued: false, kBank: false,
  typeL: false, lAccrued: false, lBank: false,
  typeM: false, mIdentify: '', mExplain: '',
  addlExplanation: '',
  employeeSig: '', employeeDate: '',
  designationOnFile: '',
  adminName: '', adminSig: '', adminDate: '',
  approved: '', explanation: '',
}

function NonIllnessForm({ data, setData }) {
  const set = (k, v) => setData(d => ({ ...d, [k]: v }))

  return (
    <div className="afm-page">
      <div className="afm-side-label">{'NONILLNESS'.split('').map((c, i) => <span key={i}>{c}</span>)}</div>
      <div className="afm-form-no">Form No. 60.NON-ILL; Reissued 1/05/2024</div>

      <FormHeader
        title="Certification and/or Request of Absence for Non-Illness"
        showSubTemp={false}
        data={data}
        set={set}
      />

      <div className="afm-reason-line" style={{ marginTop: 6 }}>
        <span className="afm-q-num">3.</span>
        <span>Select the appropriate type of absence:</span>
      </div>

      <div className="afm-type-list">
        <div className="afm-type-with-extra">
          <Check checked={data.typeA} onToggle={() => set('typeA', !data.typeA)} label="A) Accident or Imminent Danger to My Person/Property (see rule¹)" />
          <span>Explain</span>
          <TextInput value={data.explainA} onChange={v => set('explainA', v)} />
        </div>
        <div className="afm-type-with-extra">
          <Check checked={data.typeB} onToggle={() => set('typeB', !data.typeB)} label="B) Accident to Family Member's Property (see rule¹)" />
          <span>Explain</span>
          <TextInput value={data.explainB} onChange={v => set('explainB', v)} />
        </div>
        <div className="afm-type-with-extra">
          <Check checked={data.typeC} onToggle={() => set('typeC', !data.typeC)} label="C) Auto failure (up to 2 hours) if car used for work on that day (see rule²)" />
          <span>Explain</span>
          <TextInput value={data.explainC} onChange={v => set('explainC', v)} />
        </div>
        <div className="afm-type-with-extra">
          <Check checked={data.typeD} onToggle={() => set('typeD', !data.typeD)} label="D) Registration or Final Exam in Higher Education (see rule³)" />
          <span>Explain</span>
          <TextInput value={data.explainD} onChange={v => set('explainD', v)} />
        </div>
        <div className="afm-type-with-extra">
          <Check checked={data.typeE} onToggle={() => set('typeE', !data.typeE)} label="E) Religious Holiday of My Faith" />
          <PaidUnpaid value={data.ePay} onChange={v => set('ePay', v)} />
        </div>
        <div className="afm-type-with-extra">
          <Check checked={data.typeF} onToggle={() => set('typeF', !data.typeF)} label="F) Court Appearance" />
          <PaidUnpaid value={data.fPay} onChange={v => set('fPay', v)} />
        </div>
        <div className="afm-type-with-extra">
          <Check checked={data.typeG} onToggle={() => set('typeG', !data.typeG)} label="G) School Activity" />
          <PaidUnpaid value={data.gPay} onChange={v => set('gPay', v)} />
          <span>Provide Verification</span>
          <TextInput value={data.gVerify} onChange={v => set('gVerify', v)} />
        </div>
        <div className="afm-type-with-extra">
          <Check checked={data.typeH} onToggle={() => set('typeH', !data.typeH)} label="H) Bereavement (see rule⁴)" />
          <span>Identify Family Relation</span>
          <TextInput value={data.hRelation} onChange={v => set('hRelation', v)} />
        </div>
        <div className="afm-type-with-extra">
          <Check checked={data.typeI} onToggle={() => set('typeI', !data.typeI)} label="I) Conference Approved by District" />
          <span>Provide verification; Explain</span>
          <TextInput value={data.iVerify} onChange={v => set('iVerify', v)} />
        </div>
        <div className="afm-type-with-extra">
          <Check checked={data.typeJ} onToggle={() => set('typeJ', !data.typeJ)} label="J) Jury Duty" />
          <span className="afm-static-note">Provide documentation from the Court</span>
        </div>
        <div className="afm-type-with-extra">
          <Check checked={data.typeK} onToggle={() => set('typeK', !data.typeK)} label="K) Vacation (All regular classified employees & Certificated A basis)" />
          <span className="afm-static-note">Subject to Approval</span>
        </div>
        <div className="afm-sub-checks">
          <Check checked={data.kAccrued} onToggle={() => set('kAccrued', !data.kAccrued)} label="Accrued Vacation Hours Requested" />
          <Check checked={data.kBank} onToggle={() => set('kBank', !data.kBank)} label="1994 Vacation Bank Hours Requested" />
        </div>
        <div className="afm-type-with-extra">
          <Check checked={data.typeL} onToggle={() => set('typeL', !data.typeL)} label="L) Paid Parental Leave (Birth of a child/Newly adopted/New foster care)" />
          <span className="afm-static-note">Provide birth certificate or legal document</span>
        </div>
        <div className="afm-sub-checks">
          <Check checked={data.lAccrued} onToggle={() => set('lAccrued', !data.lAccrued)} label="Accrued Vacation Hours Requested" />
          <Check checked={data.lBank} onToggle={() => set('lBank', !data.lBank)} label="1994 Vacation Bank Hours Requested" />
        </div>
        <div className="afm-type-with-extra">
          <Check checked={data.typeM} onToggle={() => set('typeM', !data.typeM)} label="M) Other Absences (identify" />
          <TextInput value={data.mIdentify} onChange={v => set('mIdentify', v)} />
          <span>)</span>
          <span>Explain</span>
          <TextInput value={data.mExplain} onChange={v => set('mExplain', v)} />
        </div>
      </div>
      <p className="afm-note">
        NOTE: Absences "A" through "G" may qualify as Personal Necessity. Absences "K" and "L" may qualify for FMLA/CFRA.
      </p>

      <Cell label="Additional Explanation, if needed" grow>
        <textarea
          className="afm-textarea"
          rows={2}
          value={data.addlExplanation}
          onChange={e => set('addlExplanation', e.target.value)}
        />
      </Cell>

      <CertificationStatement />
      <SignatureBlock data={data} set={set} />

      <div className="afm-approval-row">
        <span>Is there an FMLA/CFRA/PDL Approved Designation Notice on file that covers this absence?</span>
        <YesNo value={data.designationOnFile} onChange={v => set('designationOnFile', v)} />
      </div>
      <div className="afm-section-label small">Administrator/Supervisor's Acknowledgment</div>
      <AdminAckRow data={data} set={set} />
      <ApprovalBlock data={data} set={set} />

      <p className="afm-footnotes">
        ¹ Rule to #3.A or B: Accident to property must be either your property or immediate family member's (either your family
        or spouse's, such as, parent, child, grandparent, grandchild, brother, sister, step/foster child or other relative
        living in employee's immediate household). Reference the specific section of the bargaining unit agreement or any
        applicable Board/PC rule if another relationship is claimed. Imminent danger to property includes only your property,
        and is occasioned by disaster such as flood, fire, or earthquake.<br />
        ² Rule to #3.C, F, G: Refer to applicable bargaining unit agreement or any applicable Board/PC rule.<br />
        ³ Rule to #3.D: Upon at least two days' notice to their immediate supervisor, a classified employee shall be permitted
        to take any examination and to participate in other District employment procedures during working hours without loss
        of pay or other penalty. If less than two days' notice is provided, permission to participate without loss of pay is
        subject to approval by the employee's immediate supervisor. (PC Rule 807)<br />
        ⁴ Rule to #3.H: The rule requires that the relationship be an immediate family member meaning under LAUSD's definition
        for bereavement. The immediate family is defined as the parent, grandparent or grandchild of the employee or the
        employee's spouse, and the spouse, child (including foster child), brother, sister, daughter-in-law, or son-in-law of
        the employee, or any relative living in the immediate household of the employee. Reference the specific section of the
        bargaining agreement or any applicable Board/PC rule for further information.
      </p>

      <div className="afm-form-no footer">Form No. 60.NON-ILL; Reissued 1/05/2024</div>
    </div>
  )
}

// ─── Container ──────────────────────────────────────────────────────────────

export default function AbsenceForms() {
  const [which, setWhich] = useState('illness')
  const [illness, setIllness] = useState(blankIllness)
  const [nonIllness, setNonIllness] = useState(blankNonIllness)

  function clearCurrent() {
    if (which === 'illness') setIllness(blankIllness)
    else setNonIllness(blankNonIllness)
  }

  // The app has a global print rule (see WhileYouWereOut.css) that hides
  // everything under <body> except an explicit print target, so any
  // printable feature needs its own body-level target with high enough
  // specificity to opt back in. Render the current form's live state to
  // static markup (so typed values/checkboxes are captured correctly,
  // unlike a stale DOM clone) into a frame appended directly to <body>.
  function handlePrint() {
    const formEl = which === 'illness'
      ? <IllnessForm data={illness} setData={() => {}} />
      : <NonIllnessForm data={nonIllness} setData={() => {}} />
    const html = renderToStaticMarkup(formEl)

    const frame = document.createElement('div')
    frame.id = 'afm-print-frame'
    frame.innerHTML = html
    document.body.appendChild(frame)

    const style = document.createElement('style')
    style.textContent = `@media print { #afm-print-frame { display: block !important; } }`
    document.head.appendChild(style)

    function cleanup() {
      frame.remove()
      style.remove()
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup)

    window.print()
  }

  return (
    <div className="afm-wrap">
      <div className="afm-toolbar">
        <div className="afm-form-switch">
          <button className={`afm-switch-btn ${which === 'illness' ? 'active' : ''}`} onClick={() => setWhich('illness')}>
            Illness / Family Illness / New Child
          </button>
          <button className={`afm-switch-btn ${which === 'nonillness' ? 'active' : ''}`} onClick={() => setWhich('nonillness')}>
            Non-Illness
          </button>
        </div>
        <div className="afm-toolbar-actions">
          <button className="afm-clear-btn" onClick={clearCurrent}>Clear Form</button>
          <button className="afm-print-btn" onClick={handlePrint}>Print</button>
        </div>
      </div>

      <div className="afm-scroll">
        {which === 'illness'
          ? <IllnessForm data={illness} setData={setIllness} />
          : <NonIllnessForm data={nonIllness} setData={setNonIllness} />}
      </div>
    </div>
  )
}
