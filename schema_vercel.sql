--
-- PostgreSQL database dump
--

\restrict g6nRiDXtbT1g9BfjKh8A3QewDn2ML8kr70B5inqMod9TrYnOCR4QtskPRXWBbUL

-- Dumped from database version 17.7 (Homebrew)
-- Dumped by pg_dump version 17.7 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: budget_balance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budget_balance (
    balance_id integer NOT NULL,
    year_id integer,
    surplus_deficit numeric(20,3),
    status character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: years; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.years (
    year_id integer NOT NULL,
    year_persian integer NOT NULL,
    year_gregorian character varying(20),
    currency character varying(50) DEFAULT 'billion rials'::character varying,
    data_source text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    revenue_scope character varying(100) DEFAULT 'operational_only'::character varying,
    expenditure_scope character varying(100) DEFAULT 'government_general'::character varying
);


--
-- Name: COLUMN years.revenue_scope; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.years.revenue_scope IS 'Scope of revenue data: operational_only, منابع_عمومی, or full_national';


--
-- Name: COLUMN years.expenditure_scope; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.years.expenditure_scope IS 'Scope of expenditure data: government_general or full_national';


--
-- Name: balance_analysis; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.balance_analysis AS
 SELECT y.year_persian,
    y.year_gregorian,
    b.surplus_deficit,
    b.status,
        CASE
            WHEN (b.surplus_deficit > (0)::numeric) THEN 'Surplus'::text
            WHEN (b.surplus_deficit < (0)::numeric) THEN 'Deficit'::text
            ELSE 'Balanced'::text
        END AS balance_type,
    abs(b.surplus_deficit) AS deficit_magnitude
   FROM (public.years y
     LEFT JOIN public.budget_balance b ON ((y.year_id = b.year_id)))
  ORDER BY y.year_persian;


--
-- Name: budget_balance_balance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.budget_balance_balance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: budget_balance_balance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.budget_balance_balance_id_seq OWNED BY public.budget_balance.balance_id;


--
-- Name: expenditures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenditures (
    expenditure_id integer NOT NULL,
    year_id integer,
    total numeric(20,3),
    current_exp numeric(20,3),
    capital_exp numeric(20,3),
    unclassified numeric(20,3),
    subsidy_spending numeric(20,3),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    state_comp_current_exp numeric(20,3),
    state_comp_taxes numeric(20,3),
    state_comp_special_dividend numeric(20,3),
    state_comp_dividends numeric(20,3),
    state_comp_other_profit numeric(20,3),
    state_comp_domestic_repay numeric(20,3),
    state_comp_foreign_repay numeric(20,3),
    state_comp_managed_funds numeric(20,3),
    state_comp_debt_repay numeric(20,3),
    state_comp_capital_exp numeric(20,3),
    state_comp_exp_total numeric(20,3),
    state_comp_double_counted numeric(20,3),
    state_comp_net numeric(20,3),
    state_comp_current_assets_increase numeric(20,3)
);


--
-- Name: revenues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.revenues (
    revenue_id integer NOT NULL,
    year_id integer,
    total numeric(20,3),
    tax_total numeric(20,3),
    oil_gas numeric(20,3),
    other numeric(20,3),
    tax_corporate numeric(20,3),
    tax_individual numeric(20,3),
    tax_payroll numeric(20,3),
    tax_social_security numeric(20,3),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    asset_sales numeric(20,3) DEFAULT 0,
    borrowing numeric(20,3) DEFAULT 0,
    development_fund numeric(20,3) DEFAULT 0,
    special_accounts numeric(20,3) DEFAULT 0,
    operational_revenue numeric(20,3),
    state_comp_revenues numeric(20,3),
    state_comp_current_credits numeric(20,3),
    state_comp_capital_credits numeric(20,3),
    state_comp_domestic_loans numeric(20,3),
    state_comp_foreign_loans numeric(20,3),
    state_comp_current_assets numeric(20,3),
    state_comp_other_receipts numeric(20,3),
    state_comp_financial_assets numeric(20,3),
    state_comp_revenue_total numeric(20,3)
);


--
-- Name: COLUMN revenues.total; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revenues.total IS 'Total revenues including operational + asset sales + borrowing + special accounts';


--
-- Name: COLUMN revenues.tax_total; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revenues.tax_total IS 'Total tax revenues (all categories combined)';


--
-- Name: COLUMN revenues.oil_gas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revenues.oil_gas IS 'Oil and gas export revenues';


--
-- Name: COLUMN revenues.other; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revenues.other IS 'Other operational revenues (fees, state enterprises, etc.)';


--
-- Name: COLUMN revenues.asset_sales; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revenues.asset_sales IS 'واگذاری دارایی‌های سرمایه‌ای - Asset sales (capital assets)';


--
-- Name: COLUMN revenues.borrowing; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revenues.borrowing IS 'استقراض - Government borrowing';


--
-- Name: COLUMN revenues.development_fund; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revenues.development_fund IS 'برداشت از صندوق توسعه ملی - National Development Fund withdrawals';


--
-- Name: COLUMN revenues.special_accounts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revenues.special_accounts IS 'حساب‌های ویژه - Special government accounts';


--
-- Name: COLUMN revenues.operational_revenue; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revenues.operational_revenue IS 'درآمدهای عملیاتی - Operational revenues (tax + oil + other)';


--
-- Name: budget_overview; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.budget_overview AS
 SELECT y.year_persian,
    y.year_gregorian,
    y.currency,
    y.data_source,
    r.total AS revenue_total,
    r.tax_total,
    r.oil_gas,
    r.other AS revenue_other,
    e.total AS expenditure_total,
    e.current_exp,
    e.capital_exp,
    e.unclassified,
    e.subsidy_spending,
    b.surplus_deficit,
    b.status
   FROM (((public.years y
     LEFT JOIN public.revenues r ON ((y.year_id = r.year_id)))
     LEFT JOIN public.expenditures e ON ((y.year_id = e.year_id)))
     LEFT JOIN public.budget_balance b ON ((y.year_id = b.year_id)))
  ORDER BY y.year_persian;


--
-- Name: budget_overview_detailed; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.budget_overview_detailed AS
 SELECT y.year_persian,
    y.year_gregorian,
    y.currency,
    y.data_source,
    y.revenue_scope,
    y.expenditure_scope,
    r.tax_total,
    r.oil_gas,
    r.other AS operational_other,
    r.operational_revenue,
    r.asset_sales,
    r.borrowing,
    r.development_fund,
    r.special_accounts,
    r.total AS total_revenue,
    e.total AS expenditure_total,
    e.current_exp,
    e.capital_exp,
    e.unclassified,
    e.subsidy_spending,
    b.surplus_deficit,
    b.status
   FROM (((public.years y
     LEFT JOIN public.revenues r ON ((y.year_id = r.year_id)))
     LEFT JOIN public.expenditures e ON ((y.year_id = e.year_id)))
     LEFT JOIN public.budget_balance b ON ((y.year_id = b.year_id)))
  ORDER BY y.year_persian;


--
-- Name: budget_scope_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budget_scope_notes (
    note_id integer NOT NULL,
    year_id integer,
    category character varying(50),
    scope_type character varying(100),
    included_items text[],
    excluded_items text[],
    percentage_of_total numeric(5,2),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: budget_scope_notes_note_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.budget_scope_notes_note_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: budget_scope_notes_note_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.budget_scope_notes_note_id_seq OWNED BY public.budget_scope_notes.note_id;


--
-- Name: data_quality_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_quality_notes (
    note_id integer NOT NULL,
    table_name character varying(50),
    year_persian integer,
    note_type character varying(20),
    note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: data_quality_notes_note_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.data_quality_notes_note_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: data_quality_notes_note_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.data_quality_notes_note_id_seq OWNED BY public.data_quality_notes.note_id;


--
-- Name: expenditure_analysis; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.expenditure_analysis AS
 SELECT y.year_persian,
    y.year_gregorian,
    e.total AS total_expenditure,
    e.current_exp,
    e.capital_exp,
    e.unclassified,
    e.subsidy_spending,
    round(((e.current_exp / e.total) * (100)::numeric), 2) AS current_percentage,
    round(((e.capital_exp / e.total) * (100)::numeric), 2) AS capital_percentage,
    round(((e.subsidy_spending / e.total) * (100)::numeric), 2) AS subsidy_percentage
   FROM (public.years y
     LEFT JOIN public.expenditures e ON ((y.year_id = e.year_id)))
  ORDER BY y.year_persian;


--
-- Name: expenditures_expenditure_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.expenditures_expenditure_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: expenditures_expenditure_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.expenditures_expenditure_id_seq OWNED BY public.expenditures.expenditure_id;


--
-- Name: operational_revenues_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.operational_revenues_view AS
 SELECT y.year_persian,
    y.year_gregorian,
    r.operational_revenue,
    r.tax_total,
    r.oil_gas,
    r.other,
    round(((r.tax_total / NULLIF(r.operational_revenue, (0)::numeric)) * (100)::numeric), 2) AS tax_percentage,
    round(((r.oil_gas / NULLIF(r.operational_revenue, (0)::numeric)) * (100)::numeric), 2) AS oil_percentage,
    round(((r.other / NULLIF(r.operational_revenue, (0)::numeric)) * (100)::numeric), 2) AS other_percentage
   FROM (public.years y
     JOIN public.revenues r ON ((y.year_id = r.year_id)))
  ORDER BY y.year_persian;


--
-- Name: revenue_trends; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.revenue_trends AS
 SELECT y.year_persian,
    y.year_gregorian,
    r.total AS total_revenue,
    r.tax_total,
    r.oil_gas,
    round(((r.oil_gas / r.total) * (100)::numeric), 2) AS oil_gas_percentage,
    round(((r.tax_total / r.total) * (100)::numeric), 2) AS tax_percentage,
    r.tax_corporate,
    r.tax_individual,
    r.tax_payroll,
    r.tax_social_security
   FROM (public.years y
     LEFT JOIN public.revenues r ON ((y.year_id = r.year_id)))
  ORDER BY y.year_persian;


--
-- Name: revenues_revenue_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.revenues_revenue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: revenues_revenue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.revenues_revenue_id_seq OWNED BY public.revenues.revenue_id;


--
-- Name: years_year_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.years_year_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: years_year_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.years_year_id_seq OWNED BY public.years.year_id;


--
-- Name: yoy_growth; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.yoy_growth AS
 WITH yearly_totals AS (
         SELECT y.year_persian,
            r.total AS revenue,
            e.total AS expenditure,
            b.surplus_deficit AS balance
           FROM (((public.years y
             LEFT JOIN public.revenues r ON ((y.year_id = r.year_id)))
             LEFT JOIN public.expenditures e ON ((y.year_id = e.year_id)))
             LEFT JOIN public.budget_balance b ON ((y.year_id = b.year_id)))
        )
 SELECT current.year_persian,
    current.revenue,
    previous.revenue AS prev_revenue,
    round(
        CASE
            WHEN (previous.revenue > (0)::numeric) THEN (((current.revenue - previous.revenue) / previous.revenue) * (100)::numeric)
            ELSE NULL::numeric
        END, 2) AS revenue_growth_pct,
    current.expenditure,
    previous.expenditure AS prev_expenditure,
    round(
        CASE
            WHEN (previous.expenditure > (0)::numeric) THEN (((current.expenditure - previous.expenditure) / previous.expenditure) * (100)::numeric)
            ELSE NULL::numeric
        END, 2) AS expenditure_growth_pct
   FROM (yearly_totals current
     LEFT JOIN yearly_totals previous ON ((current.year_persian = (previous.year_persian + 1))))
  ORDER BY current.year_persian;


--
-- Name: budget_balance balance_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_balance ALTER COLUMN balance_id SET DEFAULT nextval('public.budget_balance_balance_id_seq'::regclass);


--
-- Name: budget_scope_notes note_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_scope_notes ALTER COLUMN note_id SET DEFAULT nextval('public.budget_scope_notes_note_id_seq'::regclass);


--
-- Name: data_quality_notes note_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_quality_notes ALTER COLUMN note_id SET DEFAULT nextval('public.data_quality_notes_note_id_seq'::regclass);


--
-- Name: expenditures expenditure_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenditures ALTER COLUMN expenditure_id SET DEFAULT nextval('public.expenditures_expenditure_id_seq'::regclass);


--
-- Name: revenues revenue_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenues ALTER COLUMN revenue_id SET DEFAULT nextval('public.revenues_revenue_id_seq'::regclass);


--
-- Name: years year_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.years ALTER COLUMN year_id SET DEFAULT nextval('public.years_year_id_seq'::regclass);


--
-- Name: budget_balance budget_balance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_balance
    ADD CONSTRAINT budget_balance_pkey PRIMARY KEY (balance_id);


--
-- Name: budget_balance budget_balance_year_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_balance
    ADD CONSTRAINT budget_balance_year_id_key UNIQUE (year_id);


--
-- Name: budget_scope_notes budget_scope_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_scope_notes
    ADD CONSTRAINT budget_scope_notes_pkey PRIMARY KEY (note_id);


--
-- Name: data_quality_notes data_quality_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_quality_notes
    ADD CONSTRAINT data_quality_notes_pkey PRIMARY KEY (note_id);


--
-- Name: expenditures expenditures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenditures
    ADD CONSTRAINT expenditures_pkey PRIMARY KEY (expenditure_id);


--
-- Name: expenditures expenditures_year_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenditures
    ADD CONSTRAINT expenditures_year_id_key UNIQUE (year_id);


--
-- Name: revenues revenues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT revenues_pkey PRIMARY KEY (revenue_id);


--
-- Name: revenues revenues_year_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT revenues_year_id_key UNIQUE (year_id);


--
-- Name: years years_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.years
    ADD CONSTRAINT years_pkey PRIMARY KEY (year_id);


--
-- Name: years years_year_persian_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.years
    ADD CONSTRAINT years_year_persian_key UNIQUE (year_persian);


--
-- Name: idx_balance_deficit; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_balance_deficit ON public.budget_balance USING btree (surplus_deficit);


--
-- Name: idx_balance_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_balance_status ON public.budget_balance USING btree (status);


--
-- Name: idx_balance_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_balance_year ON public.budget_balance USING btree (year_id);


--
-- Name: idx_expenditures_current; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenditures_current ON public.expenditures USING btree (current_exp);


--
-- Name: idx_expenditures_total; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenditures_total ON public.expenditures USING btree (total);


--
-- Name: idx_expenditures_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenditures_year ON public.expenditures USING btree (year_id);


--
-- Name: idx_revenues_asset_sales; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_revenues_asset_sales ON public.revenues USING btree (asset_sales);


--
-- Name: idx_revenues_borrowing; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_revenues_borrowing ON public.revenues USING btree (borrowing);


--
-- Name: idx_revenues_oil_gas; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_revenues_oil_gas ON public.revenues USING btree (oil_gas);


--
-- Name: idx_revenues_tax; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_revenues_tax ON public.revenues USING btree (tax_total);


--
-- Name: idx_revenues_total; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_revenues_total ON public.revenues USING btree (total);


--
-- Name: idx_revenues_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_revenues_year ON public.revenues USING btree (year_id);


--
-- Name: idx_years_gregorian; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_years_gregorian ON public.years USING btree (year_gregorian);


--
-- Name: idx_years_persian; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_years_persian ON public.years USING btree (year_persian);


--
-- Name: budget_balance budget_balance_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_balance
    ADD CONSTRAINT budget_balance_year_id_fkey FOREIGN KEY (year_id) REFERENCES public.years(year_id) ON DELETE CASCADE;


--
-- Name: budget_scope_notes budget_scope_notes_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_scope_notes
    ADD CONSTRAINT budget_scope_notes_year_id_fkey FOREIGN KEY (year_id) REFERENCES public.years(year_id) ON DELETE CASCADE;


--
-- Name: expenditures expenditures_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenditures
    ADD CONSTRAINT expenditures_year_id_fkey FOREIGN KEY (year_id) REFERENCES public.years(year_id) ON DELETE CASCADE;


--
-- Name: revenues revenues_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT revenues_year_id_fkey FOREIGN KEY (year_id) REFERENCES public.years(year_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict g6nRiDXtbT1g9BfjKh8A3QewDn2ML8kr70B5inqMod9TrYnOCR4QtskPRXWBbUL

